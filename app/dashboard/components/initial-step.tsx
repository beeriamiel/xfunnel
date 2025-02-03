import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { CheckIcon, XIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateInitialICPs } from '@/lib/actions/generate-initial-icps';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProgressStep {
  message: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
}

interface InitialStepProps {
  onNext: () => void;
  onProgress?: (progress: number) => void;
}

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  accountId: z.string().min(1, 'Account ID is required')
});

export function InitialStep({ onNext, onProgress }: InitialStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressStep[]>([
    { message: 'Analyzing company data', status: 'pending', progress: 20 },
    { message: 'Generating ICPs', status: 'pending', progress: 40 },
    { message: 'Processing company information', status: 'pending', progress: 60 },
    { message: 'Setting up competitors', status: 'pending', progress: 80 },
    { message: 'Finalizing setup', status: 'pending', progress: 90 },
    { message: 'Setup complete', status: 'pending', progress: 100 }
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      accountId: ''
    }
  });

  const updateProgress = (message: string, currentProgress: number) => {
    setProgress(prev => {
      const newProgress = [...prev];
      const currentStep = newProgress.find(step => step.message === message);
      
      if (currentStep) {
        // Mark all previous steps as complete
        newProgress.forEach(step => {
          if (step.progress < currentProgress) {
            step.status = 'complete';
          }
        });
        
        // Mark current step as loading
        currentStep.status = 'loading';
      }
      
      return newProgress;
    });
    
    if (onProgress) {
      onProgress(currentProgress);
    }
  };

  const completeCurrentStep = () => {
    setProgress(prev => {
      const newProgress = [...prev];
      const currentStep = newProgress.find(step => step.status === 'loading');
      if (currentStep) {
        currentStep.status = 'complete';
        
        // Start next pending step if any
        const nextStep = newProgress.find(step => step.status === 'pending');
        if (nextStep) {
          nextStep.status = 'loading';
        }
      }
      return newProgress;
    });
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await generateInitialICPs(values.companyName, values.accountId);
      
      if (result) {
        completeCurrentStep();
        onNext();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
      setProgress(prev => 
        prev.map(step => ({
          ...step,
          status: step.status === 'loading' ? 'error' : step.status
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter account ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Generate ICPs
          </Button>
        </form>
      </Form>
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              {progress.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {step.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border-2" />
                  )}
                  {step.status === 'loading' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {step.status === 'complete' && (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  )}
                  {step.status === 'error' && (
                    <XIcon className="h-4 w-4 text-destructive" />
                  )}
                  <span className={cn(
                    "text-sm",
                    step.status === 'complete' && "text-muted-foreground line-through",
                    step.status === 'error' && "text-destructive"
                  )}>
                    {step.message}
                  </span>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="text-sm text-destructive mt-2">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 