import React from 'react';
import ExamplePromptCard from './ExamplePromptCard';

export default function WelcomeBanner({ userName, onPromptClick, examples = [] }) {
  return (
    <div className="text-center my-16">
      <h1 className="text-4xl font-bold text-white">Hello, {userName}</h1>
      <p className="text-xl text-gray-400 mt-2">How can I help you today?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
        {examples.map((example) => (
          <ExamplePromptCard
            key={example.id}
            prompt={example.prompt}
            taskType={example.taskType}
            onClick={onPromptClick}
          />
        ))}
      </div>
    </div>
  );
}
