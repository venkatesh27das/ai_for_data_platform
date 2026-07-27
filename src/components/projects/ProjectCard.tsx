import {
  AlertTriangle,
  Building2,
  Clock3,
  Database,
  FileText,
  FlaskConical,
  Network,
  Shield,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types/knowledge";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

const iconByName = {
  users: Users,
  shield: Shield,
  file: FileText,
  network: Network,
  flask: FlaskConical,
  building: Building2,
};

const stageTone = {
  Discovery: "teal",
  Mapping: "orange",
  Assembly: "blue",
  Validation: "purple",
  Approval: "amber",
  Published: "green",
} as const;

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const Icon = iconByName[project.iconName];

  return (
    <Card className="project-card">
      <div className="project-card__header">
        <span className={`project-card__icon project-card__icon--${project.tone}`}>
          <Icon aria-hidden="true" size={25} strokeWidth={1.8} />
        </span>
        <div className="project-card__identity">
          <strong>{project.name}</strong>
          <Badge tone={stageTone[project.stage]}>
            {project.stage === "Assembly" ? "Assembly in Progress" : project.stage}
          </Badge>
        </div>
        <strong className="project-card__readiness">{project.readiness}%</strong>
      </div>

      <div className="project-card__progress">
        <span>Readiness</span>
        <ProgressBar tone={project.tone} value={project.readiness} />
      </div>

      <div className="project-card__stats">
        <div>
          <Database aria-hidden="true" size={18} />
          <strong>{project.assetCount}</strong>
          <span>Source assets</span>
        </div>
        {project.relationshipCount ? (
          <div>
            <Network aria-hidden="true" size={18} />
            <strong>{project.relationshipCount.toLocaleString()}</strong>
            <span>Relationships</span>
          </div>
        ) : (
          <div>
            <AlertTriangle aria-hidden="true" size={18} />
            <strong>{project.attentionCount}</strong>
            <span>{project.attentionLabel}</span>
          </div>
        )}
        {project.relationshipCount && (
          <div>
            <AlertTriangle aria-hidden="true" size={18} />
            <strong>{project.attentionCount}</strong>
            <span>{project.attentionLabel}</span>
          </div>
        )}
      </div>

      <div className="project-card__footer">
        <span>
          <Clock3 aria-hidden="true" size={15} />
          Last activity&nbsp; {project.lastActivity}
        </span>
        <Button
          onClick={() => navigate(`/projects/${project.id}`)}
          variant="compact"
        >
          {project.stage === "Approval"
            ? "Review & Approve"
            : project.stage === "Validation"
              ? "Review Validation"
              : "Open Project"}
        </Button>
      </div>
    </Card>
  );
}
