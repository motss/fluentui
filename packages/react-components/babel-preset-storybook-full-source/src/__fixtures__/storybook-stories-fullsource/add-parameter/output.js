import * as React from 'react';
export const Default = () => /*#__PURE__*/ React.createElement(Button, null, 'Click me');
Default.parameters = {
  docsMode: {
    description: {
      story: 'The default story',
    },
  },
};
Default.parameters.fullSource =
  'import * as React from "react";\n\nexport const Default = () => <Button>Click me</Button>;\n';
