import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { BASE_URL } from "../App";

import styles from "./TabBar.module.css";

interface TabBarProps {
  tabs: {
    url: string;
    title: string;
  }[];
  current: string;
}

function TabBar({ tabs, current }: TabBarProps) {
  // The following hooks are used to make the tab <li>s clickable using react-router
  const navigate = useNavigate();

  return (
    <nav className={styles.TabBar}>
      <ol>
        {tabs.map(({ url, title }) => (
          <li
            key={url}
            className={url === current ? styles.ActiveTab : styles.InactiveTab}
            onClick={() => navigate(`${BASE_URL}${url}`)}
          >
            <Link to={`${BASE_URL}${url}`} className={styles.linkTest}>
              {title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TabBar;
