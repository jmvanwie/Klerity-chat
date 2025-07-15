import { useEffect, useState } from 'react';
import { fetchExamplePrompts } from '../utils/fetchExamplePrompts';
import ExamplePromptCard from '../components/ExamplePromptCard';

export default function LandingPage({ onPromptSelect }) {
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    fetchExamplePrompts().then(setExamples);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Klerity.ai</h1>
        <p className="text-muted-foreground mt-2">Select a prompt below to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map(({ id, prompt, taskType }) => (
          <ExamplePromptCard
            key={id}
            prompt={prompt}
            taskType={taskType}
            onClick={() => onPromptSelect(prompt)}
          />
        ))}
      </div>
    </div>
  );
}
