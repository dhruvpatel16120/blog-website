// Centralized list of available category icons (Heroicons outline names)
// Store icon name as string in DB; UI maps to component
import {
  CodeBracketIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  PaintBrushIcon,
  ServerIcon,
  LightBulbIcon,
  GlobeAltIcon,
  CogIcon,
  BookOpenIcon,
  BugAntIcon,
  CommandLineIcon,
  DocumentTextIcon,
  PhotoIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';

export const ICONS = {
  CodeBracketIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  PaintBrushIcon,
  ServerIcon,
  LightBulbIcon,
  GlobeAltIcon,
  CogIcon,
  BookOpenIcon,
  BugAntIcon,
  CommandLineIcon,
  DocumentTextIcon,
  PhotoIcon,
  PresentationChartLineIcon,
};

export const iconOptions = Object.keys(ICONS).map((key) => ({ value: key, label: key.replace(/Icon$/, '') }));

export function getIconComponent(name) {
  return ICONS[name] || CodeBracketIcon;
}


