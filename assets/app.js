const GITHUB_USERNAME = 'nkswapnil087';
const projectsGrid = document.getElementById('projectsGrid');
const mobileMenu = document.getElementById('mobileMenu');
const menuToggle = document.getElementById('menuToggle');

const languageColors = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#8b5cf6',
  Python: '#3572A5',
  Java: '#b07219',
  C: '#6b7280',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Jupyter: '#DA5B0B',
  Vue: '#41b883',
  Code: '#d9f99d'
};

const TARGET_PROJECTS = [
  {
    key: 'guardianlink',
    title: 'GuardianLink',
    aliases: ['guardianlink', 'guardian-link', 'guardian_link', 'guardian link'],
    repoName: 'Guardian_Link',
    category: 'Security Build',
    repoUrl: 'https://github.com/nkswapnil087/Guardian_Link',
    description: 'A project around quick access to help and useful information, with a simple flow and a focus on handling user details carefully.',
    topics: ['security', 'privacy', 'trust', 'safe-flow']
  },
  {
    key: 'crypto101',
    title: 'Crypto 101',
    aliases: ['crypto101', 'crypto-101', 'crypto_101', 'crypto 101', 'cryptography101', 'cryptography-101'],
    repoName: 'Crypto_101',
    category: 'Cryptography / CTF',
    repoUrl: 'https://github.com/nkswapnil087/Crypto_101',
    description: 'My cryptography learning space for basics like encodings, hashes, ciphers, and small CTF-style exercises.',
    topics: ['cryptography', 'ctf', 'encoding', 'ciphers']
  },
  {
    key: 'friendstourplanner',
    title: 'Friends Tour Planner',
    aliases: ['friendstourplanner', 'friends-tour-planner', 'friends_tour_planner', 'friends tour planner', 'friend-tour-planner', 'friendstour'],
    repoName: 'Friends-Tour-Planner',
    category: 'Planning App',
    repoUrl: 'https://github.com/nkswapnil087/Friends-Tour-Planner',
    description: 'A simple trip-planning app for friends: places, plans, and decisions in one place instead of scattered chats.',
    topics: ['planning', 'user-flow', 'coordination', 'practical-build']
  }
];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'GitHub';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

function safeStorageRemove(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}

function formatCount(value = 0) {
  const count = Number(value);
  if (!Number.isFinite(count)) return '0';
  return new Intl.NumberFormat('en', { notation: count >= 1000 ? 'compact' : 'standard' }).format(count);
}

function titleCaseRepoName(name = '') {
  return name
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}


function normalizeRepoName(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getTargetProjectForRepo(repo) {
  const normalizedName = normalizeRepoName(repo.name);
  return TARGET_PROJECTS.find(project =>
    project.aliases.some(alias => normalizedName === normalizeRepoName(alias))
  );
}

function attachPortfolioDetails(repo, project) {
  return {
    ...repo,
    portfolioKey: project.key,
    portfolioTitle: project.title,
    portfolioCategory: project.category,
    portfolioDescription: project.description,
    portfolioTopics: project.topics,
    portfolioUrl: project.repoUrl || repo.html_url
  };
}

function fallbackProject(project) {
  return {
    name: project.repoName || project.title,
    portfolioKey: project.key,
    portfolioTitle: project.title,
    portfolioCategory: project.category,
    portfolioDescription: project.description,
    portfolioTopics: project.topics,
    language: project.key === 'guardianlink' ? 'Java' : project.key === 'friendstourplanner' ? 'JavaScript' : 'HTML',
    updated_at: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    watchers_count: 0,
    html_url: project.repoUrl || `https://github.com/${GITHUB_USERNAME}?tab=repositories`,
    portfolioUrl: project.repoUrl || `https://github.com/${GITHUB_USERNAME}?tab=repositories`
  };
}

async function fetchFeaturedRepo(project) {
  const cacheKey = `portfolio-repo:${GITHUB_USERNAME}:${project.repoName}`;
  const cacheDuration = 1000 * 60 * 60 * 6;
  const cached = safeStorageGet(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < cacheDuration) {
        return attachPortfolioDetails(parsed.repo, project);
      }
    } catch (_) {
      safeStorageRemove(cacheKey);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(project.repoName)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'force-cache',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Could not load ${project.repoName}`);
    }

    const repo = await response.json();
    safeStorageSet(cacheKey, JSON.stringify({ timestamp: Date.now(), repo }));
    return attachPortfolioDetails(repo, project);
  } finally {
    clearTimeout(timeout);
  }
}

function repoCard(repo, index) {
  const language = repo.language || 'Code';
  const color = languageColors[language] || '#d9f99d';
  const displayTitle = repo.portfolioTitle || titleCaseRepoName(repo.name);
  const category = repo.portfolioCategory || 'Project';
  const description = repo.portfolioDescription || repo.description || 'A GitHub project focused on learning, implementation, and practical problem solving.';
  const topics = repo.portfolioTopics || (Array.isArray(repo.topics) ? repo.topics.slice(0, 3) : []);
  const repoUrl = repo.portfolioUrl || repo.html_url;
  const updatedLabel = repo.updated_at ? formatDate(repo.updated_at) : 'GitHub';
  const homepage = repo.homepage
    ? `<span class="card-cta rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/70">Live available</span>`
    : '';

  return `
    <a href="${escapeHtml(repoUrl)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(displayTitle)} project on GitHub" class="clickable-card group reveal project-card glass hairline overflow-hidden rounded-[2.35rem] p-6 md:p-8" style="transition-delay:${Math.min(index * 80, 320)}ms">
      <div class="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-20 blur-3xl" style="background:${color}"></div>
      <div class="relative z-10 flex h-full flex-col">
        <div class="flex items-start justify-between gap-5">
          <div>
            <p class="text-sm font-black uppercase tracking-[.24em] text-white/35">${escapeHtml(category)} · Case ${String(index + 1).padStart(2, '0')}</p>
            <h3 class="mt-5 text-3xl font-black tracking-[-.035em] text-white md:text-4xl">${escapeHtml(displayTitle)}</h3>
          </div>
          <span class="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/48">${escapeHtml(updatedLabel)}</span>
        </div>

        <p class="mt-6 max-w-2xl flex-1 leading-8 text-white/56">${escapeHtml(description)}</p>

        <div class="mt-8 flex flex-wrap gap-2">
          <span class="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-white/68"><span class="mr-2 inline-block h-2 w-2 rounded-full" style="background:${color}"></span>${escapeHtml(language)}</span>
          ${topics.map(topic => `<span class="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-bold text-white/45">${escapeHtml(topic)}</span>`).join('')}
        </div>

        <div class="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div class="flex flex-wrap gap-4 text-sm font-semibold text-white/45">
            <span title="GitHub stars">★ ${formatCount(repo.stargazers_count)}</span>
            <span title="GitHub forks">⑂ ${formatCount(repo.forks_count)}</span>
            <span title="GitHub open issues">● ${formatCount(repo.open_issues_count)}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${homepage}
            <span class="card-cta card-cta-dark rounded-full bg-bone px-4 py-2 text-sm font-black text-black transition group-hover:scale-[1.04] group-hover:bg-white">Code ↗</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

function skeletonCards() {
  projectsGrid.innerHTML = Array.from({ length: 3 }).map(() => `
    <div class="glass rounded-[2.35rem] p-6 md:p-8">
      <div class="h-4 w-24 animate-pulse rounded-full bg-white/10"></div>
      <div class="mt-7 h-10 w-3/4 animate-pulse rounded-2xl bg-white/10"></div>
      <div class="mt-6 space-y-3">
        <div class="h-4 animate-pulse rounded-full bg-white/10"></div>
        <div class="h-4 w-5/6 animate-pulse rounded-full bg-white/10"></div>
        <div class="h-4 w-4/6 animate-pulse rounded-full bg-white/10"></div>
      </div>
      <div class="mt-10 h-12 animate-pulse rounded-full bg-white/10"></div>
    </div>
  `).join('');
}

let githubDataLoaded = false;

function renderInitialProjects() {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = TARGET_PROJECTS
    .map((project, index) => repoCard(fallbackProject(project), index))
    .join('');
  initRevealObserver();
}

async function loadGitHubData() {
  if (githubDataLoaded || !projectsGrid) return;
  githubDataLoaded = true;

  try {
    const results = await Promise.allSettled(TARGET_PROJECTS.map(project => fetchFeaturedRepo(project)));
    const displayProjects = results.map((result, index) => (
      result.status === 'fulfilled'
        ? result.value
        : fallbackProject(TARGET_PROJECTS[index])
    ));

    projectsGrid.innerHTML = displayProjects.map(repoCard).join('');
    initRevealObserver();
  } catch (_) {
    // Static fallback cards are already visible, so a network failure is harmless.
  }
}

function scheduleGitHubData() {
  const workSection = document.getElementById('work');
  const start = () => loadGitHubData();

  if (workSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { rootMargin: '800px 0px' });
    observer.observe(workSection);
    return;
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2500 });
  } else {
    setTimeout(start, 1200);
  }
}

function initRevealObserver() {
  const items = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -55px 0px' });

  items.forEach(item => observer.observe(item));
}

function initMagnetic() {
  // Kept as a no-op for compatibility. CSS hover now handles card movement.
  // This removes expensive mousemove layout reads and per-frame 3D transforms.
}

function initCursorGlow() {
  // Static background: avoids full-page repainting on every pointer movement.
}

function initMobileMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.textContent = isOpen ? 'Menu' : 'Close';
  });

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
  };

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
initRevealObserver();
initMagnetic();
initCursorGlow();
initMobileMenu();
renderInitialProjects();
scheduleGitHubData();
