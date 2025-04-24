interface Window {
  googleTranslateElementInit?: () => void;
  google?: {
    translate: {
      TranslateElement: {
        new (options: {
          pageLanguage: string;
          layout: any;
        }, elementId: string): any;
        InlineLayout: {
          SIMPLE: any;
          HORIZONTAL: any;
          VERTICAL: any;
        };
      };
    };
  };
} 