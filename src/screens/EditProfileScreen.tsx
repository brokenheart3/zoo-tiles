import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { ThemeContext, themeStyles } from '../context/ThemeContext';
import { useProfile, ProfileData } from '../context/ProfileContext'; // Add this

type EditProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'EditProfile'>;
type EditProfileScreenRouteProp = RouteProp<SettingsStackParamList, 'EditProfile'>;

const genderIcons = [
  { id: 'male1', icon: '😎', label: 'Cool Guy' },
  { id: 'male2', icon: '🧔', label: 'Beard' },
  { id: 'male3', icon: '👨‍💼', label: 'Business' },
  { id: 'female1', icon: '👩', label: 'Woman' },
  { id: 'female2', icon: '👸', label: 'Princess' },
  { id: 'female3', icon: '💁‍♀️', label: 'Hair Flip' },
  { id: 'neutral1', icon: '🤖', label: 'Robot' },
  { id: 'neutral2', icon: '🦊', label: 'Fox' },
  { id: 'neutral3', icon: '🐱', label: 'Cat' },
  { id: 'neutral4', icon: '🌈', label: 'Rainbow' },
  { id: 'neutral5', icon: '🎮', label: 'Gamer' },
  { id: 'neutral6', icon: '📚', label: 'Bookworm' },
];

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const route = useRoute<EditProfileScreenRouteProp>();
  const { theme } = useContext(ThemeContext);
  const { profile, updateProfile } = useProfile(); // Get profile and update function
  const colors = themeStyles[theme];
  
  const { userData } = route.params || {};
  
  // Initialize form with current profile data
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [selectedIcon, setSelectedIcon] = useState(profile.avatar);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setShowIconPicker(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    
    // Update profile in context (and AsyncStorage)
    await updateProfile({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatar: selectedIcon,
    });
    
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: colors.text }]}>Edit Profile</Text>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Profile Picture</Text>
          
          {/* Current Avatar Display */}
          <TouchableOpacity 
            style={styles.currentAvatarContainer}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={[styles.iconAvatar, { backgroundColor: colors.button }]}>
              <Text style={styles.iconAvatarText}>{selectedIcon}</Text>
              <View style={[styles.editBadge, { backgroundColor: colors.background }]}>
                <Ionicons name="pencil" size={16} color={colors.text} />
              </View>
            </View>
            <Text style={[styles.changeText, { color: colors.text }]}>Tap to change icon</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.button,
                color: colors.text,
                borderColor: colors.text,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.text === '#000000' ? '#666' : '#aaa'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.button,
                color: colors.text,
                borderColor: colors.text,
              }]}
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              placeholderTextColor={colors.text === '#000000' ? '#666' : '#aaa'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.button,
                color: colors.text,
                borderColor: colors.text,
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.text === '#000000' ? '#666' : '#aaa'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: colors.button,
                color: colors.text,
                borderColor: colors.text,
              }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.text === '#000000' ? '#666' : '#aaa'}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: colors.button }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: colors.button }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: colors.text }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose an Icon</Text>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.iconGrid}>
              {genderIcons.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconOption,
                    { backgroundColor: colors.button },
                    selectedIcon === item.icon && styles.selectedIconOption
                  ]}
                  onPress={() => handleIconSelect(item.icon)}
                >
                  <Text style={styles.iconText}>{item.icon}</Text>
                  <Text style={[styles.iconLabel, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  avatarSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  currentAvatarContainer: {
    alignItems: 'center',
  },
  iconAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  iconAvatarText: {
    fontSize: 60,
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  changeText: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.8,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  saveButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconOption: {
    width: '30%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  selectedIconOption: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  iconText: {
    fontSize: 40,
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default EditProfileScreen;