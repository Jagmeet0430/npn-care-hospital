import type { IconKey } from "@/lib/cms";
import { getIcon } from "@/lib/cms";

type CmsIconProps = {
  iconKey: IconKey;
  size?: number;
};

export function CmsIcon({ iconKey, size = 22 }: CmsIconProps) {
  const Icon = getIcon(iconKey);
  return <Icon size={size} />;
}
