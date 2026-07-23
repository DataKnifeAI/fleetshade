import type { PlatformBacklog, Priority } from "../types";
import { priorityClass } from "../lib/format";
import { topByPriority } from "../lib/priority";

interface Props {
  github: PlatformBacklog;
  gitlab: PlatformBacklog;
}

export function BacklogPanel({ github, gitlab }: Props) {
  return (
    <section className="panel wide">
      <div className="panel-head">
        <h2>Issue backlog</h2>
        <span className="sub">Top 10 by priority · per platform</span>
      </div>
      <div className="backlog">
        <PlatformColumn
          mark="GH"
          markClass="gh"
          title="GitHub"
          backlog={github}
          repoLabel="Repo"
        />
        <PlatformColumn
          mark="GL"
          markClass="gl"
          title="GitLab"
          backlog={gitlab}
          repoLabel="Project"
        />
      </div>
    </section>
  );
}

function PlatformColumn({
  mark,
  markClass,
  title,
  backlog,
  repoLabel,
}: {
  mark: string;
  markClass: string;
  title: string;
  backlog: PlatformBacklog;
  repoLabel: string;
}) {
  const top = topByPriority(backlog.top, 10);
  return (
    <div className="platform">
      <div className="platform-head">
        <div className="name">
          <span className={`mark ${markClass}`}>{mark}</span> {title}
        </div>
        <div className="count">
          showing {top.length} · <strong>{backlog.totalOpen}</strong> open
        </div>
      </div>
      <table className="issues">
        <thead>
          <tr>
            <th>Pri</th>
            <th>Issue</th>
            <th>{repoLabel}</th>
          </tr>
        </thead>
        <tbody>
          {top.map((issue) => (
            <tr key={issue.id}>
              <td>
                <span className={`pri ${priorityClass(issue.priority as Priority)}`}>
                  {issue.priority}
                </span>
              </td>
              <td>
                {issue.url ? (
                  <a className="issue-title" href={issue.url} target="_blank" rel="noreferrer">
                    <span className="id">#{issue.number}</span> {issue.title}
                  </a>
                ) : (
                  <span className="issue-title">
                    <span className="id">#{issue.number}</span> {issue.title}
                  </span>
                )}
              </td>
              <td className="issue-meta">{issue.repo}</td>
            </tr>
          ))}
          {top.length === 0 && (
            <tr>
              <td colSpan={3} className="issue-meta">
                No open issues
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
