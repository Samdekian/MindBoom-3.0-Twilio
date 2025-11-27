export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: 'anxiety' | 'depression' | 'relationships' | 'stress' | 'self-esteem' | 'communication';
  suggestedTimeframe: number; // in weeks
  examples: string[];
}

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'anxiety-management',
    title: 'Manage Anxiety Better',
    description: 'Learn coping strategies to reduce anxiety in daily situations',
    category: 'anxiety',
    suggestedTimeframe: 8,
    examples: [
      'Practice deep breathing when feeling anxious',
      'Identify and challenge negative thoughts',
      'Use grounding techniques in stressful situations'
    ]
  },
  {
    id: 'depression-recovery',
    title: 'Improve Daily Mood',
    description: 'Develop habits and strategies to feel more positive day-to-day',
    category: 'depression',
    suggestedTimeframe: 12,
    examples: [
      'Establish a consistent morning routine',
      'Engage in enjoyable activities regularly',
      'Build a support network'
    ]
  },
  {
    id: 'relationship-improvement',
    title: 'Build Better Relationships',
    description: 'Strengthen connections with family, friends, or romantic partners',
    category: 'relationships',
    suggestedTimeframe: 10,
    examples: [
      'Communicate needs more clearly',
      'Set healthy boundaries',
      'Practice active listening skills'
    ]
  },
  {
    id: 'stress-reduction',
    title: 'Reduce Daily Stress',
    description: 'Learn to manage work, life, and emotional stress more effectively',
    category: 'stress',
    suggestedTimeframe: 6,
    examples: [
      'Develop time management skills',
      'Practice relaxation techniques',
      'Learn to say no when overwhelmed'
    ]
  },
  {
    id: 'self-esteem-building',
    title: 'Build Self-Confidence',
    description: 'Develop a more positive self-image and increase self-worth',
    category: 'self-esteem',
    suggestedTimeframe: 10,
    examples: [
      'Challenge negative self-talk',
      'Celebrate personal achievements',
      'Practice self-compassion'
    ]
  },
  {
    id: 'communication-skills',
    title: 'Improve Communication',
    description: 'Express thoughts and feelings more clearly and assertively',
    category: 'communication',
    suggestedTimeframe: 8,
    examples: [
      'Use "I" statements when expressing feelings',
      'Practice assertiveness without aggression',
      'Learn conflict resolution skills'
    ]
  }
];

export const getCategoryColor = (category: GoalTemplate['category']) => {
  const colors = {
    anxiety: 'bg-blue-100 text-blue-800 border-blue-200',
    depression: 'bg-purple-100 text-purple-800 border-purple-200',
    relationships: 'bg-pink-100 text-pink-800 border-pink-200',
    stress: 'bg-orange-100 text-orange-800 border-orange-200',
    'self-esteem': 'bg-green-100 text-green-800 border-green-200',
    communication: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colors[category];
};