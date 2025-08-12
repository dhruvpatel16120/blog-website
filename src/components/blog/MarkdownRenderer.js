import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Renders markdown content as HTML using react-markdown, with code syntax highlighting.
 * @param {Object} props
 * @param {string} props.content - The markdown content to render.
 */
const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"
                {...props}
              >
                <code className={`language-${match[1]}`}>
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;