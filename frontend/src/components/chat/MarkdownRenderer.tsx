import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 🔥 核心修复函数：预处理 LaTeX 格式
// AI 经常返回 \[ \] 和 \( \) 格式，但 remark-math 需要 $$ $$ 和 $ $
const preprocessLaTeX = (content: string) => {
  if (!content) return '';
  return content
    // 1. 将块级公式 \[ ... \] 替换为 $$ ... $$
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$')
    // 2. 将行内公式 \( ... \) 替换为 $ ... $
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  
  // 使用 useMemo 优化性能，只在 content 变化时重新处理
  const processedContent = useMemo(() => preprocessLaTeX(content), [content]);

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeHighlight
        ]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            // 跳过 math 类的 code 元素，让 KaTeX 处理
            if (className?.includes('language-math')) {
              return <code className={className} {...props}>{children}</code>;
            }
            
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="relative my-4">
                <div className="absolute top-0 right-0 px-2 py-1 text-xs text-muted-foreground bg-muted/50 rounded-bl-lg rounded-tr-lg">
                  {match ? match[1] : 'text'}
                </div>
                <pre className={cn('rounded-lg p-4 overflow-x-auto bg-[#0d1117]', className)}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-pink-500"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>;
          },
          li({ children }) {
            return <li className="ml-1">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 border-b pb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 border-b pb-1">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 bg-muted/20 py-2 pr-2 rounded-r">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/50">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 whitespace-nowrap text-sm">{children}</td>;
          },
          tr({ children }) {
            return <tr className="divide-x divide-border">{children}</tr>;
          },
          a({ children, href }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline cursor-pointer"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};