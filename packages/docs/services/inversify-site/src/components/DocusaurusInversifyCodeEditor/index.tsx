import BrowserOnly from '@docusaurus/BrowserOnly';
import { InversifyCodeEditor } from '@inversifyjs/react-code-runner/InversifyCodeEditor';

import { Button } from '../Button';

export default function DocusaurusInversifyCodeEditor({
  style,
}: {
  style?: React.CSSProperties;
}) {
  return (
    <BrowserOnly>
      {() => <InversifyCodeEditor Button={Button} style={style} />}
    </BrowserOnly>
  );
}
