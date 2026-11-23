import { useNavigation } from "react-router";
import { cx } from "../../lib/classNames";

export function NavigationProgress() {
  const { state } = useNavigation();
  return (
    <div
      className={cx("nav-progress", state === "loading" && "is-active")}
      aria-hidden="true"
    />
  );
}
