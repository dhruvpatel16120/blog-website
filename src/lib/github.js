/**
 * GitHub Open Source Integration for TechBlog
 * Repo: https://github.com/dhruvpatel16120/blog-website
 */

export const REPO_OWNER = 'dhruvpatel16120';
export const REPO_NAME = 'blog-website';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

// Reliable fallback data based on actual repository state
export const FALLBACK_REPO_DATA = {
  name: 'blog-website',
  full_name: `${REPO_OWNER}/${REPO_NAME}`,
  html_url: REPO_URL,
  description: 'TechBlog is an open-source, production-ready blog platform built with Next.js 15, React, Tailwind CSS, and PostgreSQL.',
  stargazers_count: 2,
  forks_count: 0,
  open_issues_count: 0,
  watchers_count: 2,
  language: 'JavaScript',
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT',
  },
  default_branch: 'main',
  topics: [
    'nextjs',
    'reactjs',
    'web-development',
    'blog',
    'admin-panel',
    'next-auth',
    'prisma',
    'tailwind-css'
  ],
};

export const FALLBACK_CONTRIBUTORS = [
  {
    login: 'dhruvpatel16120',
    name: 'Dhruv Patel',
    role: 'Creator & Lead Maintainer',
    bio: 'Full-stack engineer building scalable open-source web applications and developer tools.',
    avatar_url: 'https://avatars.githubusercontent.com/u/143148503?v=4',
    html_url: 'https://github.com/dhruvpatel16120',
    contributions: 35,
    type: 'User',
  },
];

/**
 * Fetch public repository metadata from GitHub API with caching and fallback
 */
export async function getRepoData() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TechBlog-OpenSource-App',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status}, using fallback repo data`);
      return FALLBACK_REPO_DATA;
    }

    const data = await res.json();
    return {
      ...FALLBACK_REPO_DATA,
      ...data,
      license: data.license || FALLBACK_REPO_DATA.license,
    };
  } catch (error) {
    console.warn('Error fetching repo data from GitHub API, using fallback:', error.message);
    return FALLBACK_REPO_DATA;
  }
}

/**
 * Fetch contributors from GitHub API with caching and fallback
 */
export async function getContributors() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TechBlog-OpenSource-App',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status}, using fallback contributors`);
      return FALLBACK_CONTRIBUTORS;
    }

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      return FALLBACK_CONTRIBUTORS;
    }

    return list.map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      contributions: c.contributions || 1,
      type: c.type,
      role: c.login.toLowerCase() === REPO_OWNER.toLowerCase() 
        ? 'Creator & Lead Maintainer' 
        : 'Open Source Contributor',
    }));
  } catch (error) {
    console.warn('Error fetching contributors from GitHub API, using fallback:', error.message);
    return FALLBACK_CONTRIBUTORS;
  }
}
