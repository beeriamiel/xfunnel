import { generateQuestionsAction } from '../actions/generate';

interface ResponseTableProps {
  companyName: string;
  personaId: string;
  accountId: string;
  productId: string;
}

export function ResponseTable({
  companyName,
  personaId,
  accountId,
  productId,
}: ResponseTableProps) {
  console.log('🔍 ResponseTable - Initial Props:', {
    productId: {
      value: productId,
      type: typeof productId,
      asNumber: Number(productId),
      raw: productId
    },
    companyName,
    personaId,
    accountId
  });

  const handleGenerateQuestions = async () => {
    console.log('🔍 ResponseTable - Before Generate:', {
      productId: {
        value: productId,
        type: typeof productId,
        asNumber: Number(productId),
        isValid: !isNaN(Number(productId))
      }
    });

    const result = await generateQuestionsAction(
      companyName,
      Number(personaId),
      accountId,
      Number(productId)
    );

    console.log('🔍 ResponseTable - After Generate:', {
      result,
      productId: {
        originalValue: productId,
        passedValue: Number(productId)
      }
    });

    return result;
  };
} 