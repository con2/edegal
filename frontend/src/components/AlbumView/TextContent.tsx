import * as React from 'react';


interface TextContentProps {
  content: string;
}


export default class TextContent extends React.PureComponent<TextContentProps, {}> {
  render() {
    const { content } = this.props;
    return (
      <div className="TextContent">
        <div className="container" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }
}
