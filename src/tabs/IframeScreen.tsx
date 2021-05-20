import { useRef } from 'react';
import { useRouteMatch, Switch, Route } from 'react-router';
import { useRect } from '../util/hooks';
import RectProvider from '../providers/RectProvider';
import IframeMap from '../components/IframeMap';
import IframeChart from '../components/IframeChart';

function IframeScreen() {
  // We compute the size of the content div and supply it in a context to children
  const { path, url } = useRouteMatch();
  const contentDivRef = useRef<HTMLDivElement>(null);
  const rect = useRect(contentDivRef);

  console.log('Rendering iframe screen.');
  console.log('path is', path);

  return (
    <RectProvider rect={rect}>
      <div ref={contentDivRef} style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        border: "none",
        top: 0,
        left: 0,
      }}>
        <Switch>
          <Route exact path={path}>
            <IframeMap />
          </Route>
          <Route path={`${path}/:tileId/`}>
            <IframeChart iframeUrl={path} />
          </Route>
        </Switch>
      </div>
    </RectProvider>
  );
}

export default IframeScreen;
