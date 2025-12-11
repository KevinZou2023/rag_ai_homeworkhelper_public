import React from 'react';
import { MessageSquare, Lightbulb, Code, BookOpen } from 'lucide-react';

const starterPrompts = [
  {
    icon: MessageSquare,
    title: '帮我解答问题',
    description: '我可以回答你的各种问题',
  },
  {
    icon: Lightbulb,
    title: '创意灵感',
    description: '一起头脑风暴，激发创意',
  },
  {
    icon: Code,
    title: '编程辅助',
    description: '代码编写、调试、优化建议',
  },
  {
    icon: BookOpen,
    title: '学习辅导',
    description: '知识讲解、作业辅导',
  },
];

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          智能对话助手
        </h1>
        <p className="text-muted-foreground text-lg">我时刻准备着为您服务</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {starterPrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onPromptClick(prompt.description)}
              className="group p-6 rounded-lg border border-border bg-card hover:bg-accent transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{prompt.title}</h3>
                  <p className="text-sm text-muted-foreground">{prompt.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
