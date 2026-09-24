import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { ERROR_DIALOG_CLOSE_LABEL, ERROR_DIALOG_TITLE } from './constants';
import { sharedStyles } from './styles';

/**
 * Shown when a request the user is waiting on fails. Every feature reports
 * through the same dialog, so a failed fetch says so once instead of leaving
 * an empty panel to be read as no data.
 */
function ErrorDialog({ show, title, message, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <View style={sharedStyles.dialogContainer}>
      <Pressable style={sharedStyles.dialogBackdrop} onPress={onClose} />
      <View style={sharedStyles.dialogCard}>
        <Text style={sharedStyles.dialogTitle}>
          {title ?? ERROR_DIALOG_TITLE}
        </Text>
        <Text style={sharedStyles.dialogMessage}>{message}</Text>
        <Pressable style={sharedStyles.dialogButton} onPress={onClose}>
          <Text style={sharedStyles.dialogButtonText}>
            {ERROR_DIALOG_CLOSE_LABEL}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export { ErrorDialog };
