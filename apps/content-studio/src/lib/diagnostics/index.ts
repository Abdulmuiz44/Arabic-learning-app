export const printDiagnostics = (messages: string[]): void => {
  if (!messages.length) {
    console.log('No diagnostics found.');
    return;
  }

  messages.forEach((message) => console.log(`- ${message}`));
};
