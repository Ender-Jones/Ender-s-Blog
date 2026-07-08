import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const login = process.env.GITHUB_LOGIN ?? 'Ender-Jones';
const weeks = Number(process.env.ACTIVITY_WEEKS ?? 12);
const now = new Date();
const { start, end, dayCount } = getAlignedWindow(weeks, now);
const days = await readGitHubContributionDays({ login, start, end, dayCount });

const snapshot = {
  generatedAt: now.toISOString(),
  login,
  weeks,
  source: 'github contributionsCollection',
  days,
};

writeFileSync(join(root, 'src/data/github-activity.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Updated src/data/github-activity.json with ${days.length} days for ${login}.`);

async function readGitHubContributionDays({ login, start, end, dayCount }) {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    login,
    from: start.toISOString(),
    to: end.toISOString(),
  };

  const data = process.env.GITHUB_TOKEN
    ? await queryWithToken(query, variables)
    : queryWithGhCli(query, variables);

  const contributionDays =
    data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap((week) => week.contributionDays) ?? [];
  const counts = new Map(
    contributionDays.map((day) => [day.date, Number(day.contributionCount) || 0]),
  );

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = formatDateKey(date);

    return {
      date: key,
      count: counts.get(key) ?? 0,
    };
  });
}

async function queryWithToken(query, variables) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
      'user-agent': 'personal-blog-astro-build',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL returned errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
}

function queryWithGhCli(query, variables) {
  const output = execFileSync(
    'gh',
    ['api', 'graphql', '-f', `query=${query}`, '-f', `login=${variables.login}`, '-f', `from=${variables.from}`, '-f', `to=${variables.to}`],
    { encoding: 'utf8' },
  );
  const payload = JSON.parse(output);

  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL returned errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
}

function getAlignedWindow(weeks, now) {
  const dayCount = weeks * 7;
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(end.getDate() - dayCount + 1);
  start.setHours(0, 0, 0, 0);

  return { start, end, dayCount };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
