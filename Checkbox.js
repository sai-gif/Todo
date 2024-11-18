import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

const Checkbox = ({ initialValue = false, onValueChange = () => {} }) => {
  const [isChecked, setIsChecked] = useState(initialValue);

  const handlePress = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onValueChange(newValue);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={[styles.checkbox, isChecked && styles.checked]}>
        {isChecked && (
          <View style={styles.checkmark}>
            <View style={[styles.checkmarkLine, styles.checkmarkLeftLine]} />
            <View style={[styles.checkmarkLine, styles.checkmarkRightLine]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkLine: {
    position: 'absolute',
    backgroundColor: 'white',
    height: 2,
  },
  checkmarkLeftLine: {
    width: '35%',
    transform: [{ rotate: '45deg' }],
    left: '20%',
    top: '50%',
  },
  checkmarkRightLine: {
    width: '60%',
    transform: [{ rotate: '-45deg' }],
    right: '15%',
    top: '40%',
  },
});

export default Checkbox;