import { StyleSheet } from 'react-native';

export const sharedTypography = StyleSheet.create({
  arabicText: {
    fontSize: 30,
    lineHeight: 44,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  transliterationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  englishText: {
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  arabicBlock: {
    marginVertical: 8,
  },
});
