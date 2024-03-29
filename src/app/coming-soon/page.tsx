import styles from "./page.module.scss";
import { RollerContainer } from "@/components/RollerContainer";
import { ComingSoonComponent } from "@/containers/coming-soon-page/ComingSoonComponent";

export default function ComingSoon() {
  return (
    <div className={styles.noOverflow}>
      <RollerContainer haveMargin={false}>
        <ComingSoonComponent/>
      </RollerContainer>
    </div>
  );
}
