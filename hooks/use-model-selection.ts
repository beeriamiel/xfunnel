import { useState } from 'react';
import { AIModelType } from '@/lib/services/ai/types';
import { ModelSelection } from '@/app/company-actions';

const DEFAULT_MODEL: AIModelType = 'claude-3-5-sonnet-20241022';

interface ModelSelectionConfig {
  icpModel?: AIModelType;
  questionModel?: AIModelType;
}

export function useModelSelection(config?: ModelSelectionConfig) {
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    icpModel: config?.icpModel || DEFAULT_MODEL,
    questionModel: config?.questionModel || DEFAULT_MODEL,
  });

  const updateICPModel = (model: AIModelType) => {
    setModelSelection(prev => ({
      ...prev,
      icpModel: model,
    }));
  };

  const updateQuestionModel = (model: AIModelType) => {
    setModelSelection(prev => ({
      ...prev,
      questionModel: model,
    }));
  };

  return {
    modelSelection,
    updateICPModel,
    updateQuestionModel,
  };
} 