interface PromptContext {
  persona?: {
    title?: string;
    department?: string;
    seniority_level?: string;
  };
  icp?: {
    vertical?: string;
    company_size?: string;
    region?: string;
  };
  company: {
    name: string;
    industry?: string | null;
    product_category?: string | null;
  };
  competitors?: string[];
}

function formatCompetitorList(competitors: string[]): string {
  if (competitors.length === 0) {
    return "no direct competitors";
  }
  if (competitors.length === 1) {
    return competitors[0];
  }
  if (competitors.length === 2) {
    return `${competitors[0]} and ${competitors[1]}`;
  }
  return `${competitors.slice(0, -1).join(', ')}, and ${competitors[competitors.length - 1]}`;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parsePrompt(promptText: string, context: PromptContext): string {
  // Log input for debugging
  console.log('Parsing prompt with context:', {
    promptTextPreview: promptText.slice(0, 100) + '...',
    context: {
      persona: context.persona,
      icp: context.icp,
      company: {
        name: context.company.name,
        industry: context.company.industry,
        product_category: context.company.product_category
      },
      competitorsCount: context.competitors?.length || 0
    }
  });

  const replacements = {
    '[[PERSONA_TITLE]]': context.persona?.title || '[PERSONA_TITLE]',
    '[[PERSONA_DEPARTMENT]]': context.persona?.department || '[PERSONA_DEPARTMENT]',
    '[[PERSONA_SENIORITY]]': context.persona?.seniority_level || '[PERSONA_SENIORITY]',
    '[[ICP_VERTICAL]]': context.icp?.vertical || '[ICP_VERTICAL]',
    '[[ICP_COMPANY_SIZE]]': context.icp?.company_size || '[ICP_COMPANY_SIZE]',
    '[[ICP_REGION]]': context.icp?.region || '[ICP_REGION]',
    '[[COMPANY_NAME]]': context.company.name || '[COMPANY_NAME]',
    '[[COMPANY_INDUSTRY]]': context.company.industry || 'the industry',
    '[[PRODUCT_CATEGORY]]': context.company.product_category || 'the product category',
    '[[COMPETITORS_LIST]]': formatCompetitorList(context.competitors || [])
  };

  // Log replacements for debugging
  console.log('Replacement values:', Object.fromEntries(
    Object.entries(replacements).map(([key, value]) => [
      key,
      value.length > 50 ? value.slice(0, 50) + '...' : value
    ])
  ));

  // Process replacements with escaped regex and fallback values
  const result = Object.entries(replacements)
    .filter(([placeholder]) => promptText.includes(placeholder))
    .reduce(
      (text, [placeholder, value]) => {
        const regex = new RegExp(escapeRegExp(placeholder), 'g');
        const replacement = value || placeholder;
        const newText = text.replace(regex, replacement);
        
        // Log each replacement for debugging
        if (text !== newText) {
          console.log(`Replaced "${placeholder}" with "${replacement.slice(0, 50)}${replacement.length > 50 ? '...' : ''}"`);
        }
        
        return newText;
      },
      promptText
    );

  // Log output preview for debugging
  console.log('Parsed result preview:', result.slice(0, 100) + '...');

  return result;
}

// Example usage and test cases (commented out in production)
/*
const testCases = [
  {
    name: "Complete context",
    context: {
      persona: { title: "VP of Sales", department: "Sales", seniority_level: "vp_level" },
      icp: { vertical: "Technology", company_size: "enterprise_1000_5000", region: "north_america" },
      company: { name: "Acme Corp", industry: "Software", product_category: "CRM" },
      competitors: ["Comp1", "Comp2", "Comp3"]
    }
  },
  {
    name: "Missing optional fields",
    context: {
      company: { name: "Acme Corp" }
    }
  },
  {
    name: "Special characters in values",
    context: {
      persona: { title: "VP of [Sales]", department: "Sales & Marketing" },
      company: { name: "Acme (Corp)" }
    }
  }
];

testCases.forEach(test => {
  console.log(`\nTesting: ${test.name}`);
  const result = parsePrompt(
    "[[PERSONA_TITLE]] at [[COMPANY_NAME]] in [[ICP_REGION]] competing with [[COMPETITORS_LIST]]",
    test.context as PromptContext
  );
  console.log('Result:', result);
});
*/ 