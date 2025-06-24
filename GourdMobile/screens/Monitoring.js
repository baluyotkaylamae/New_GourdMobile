import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  RefreshControl,
  Alert,
  ScrollView
} from "react-native";
import EasyButton from "../Shared/StyledComponents/EasyButton";
import baseURL from "../assets/common/baseurl";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from "@react-native-community/datetimepicker";
import AuthGlobal from '../Context/Store/AuthGlobal';
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";
import Toast from "react-native-toast-message";

const MonitoringScreen = () => {
  const context = useContext(AuthGlobal);
  const userId = context.stateUser.user?.userId;
  const [editMonitoringData, setEditMonitoringData] = useState(null);

  const [gourdTypes, setGourdTypes] = useState([]);
  const [monitorings, setMonitorings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(null);
  const [GourdTypeOpen, setGourdTypeOpen] = useState(false);
  const [modalGourdTypeOpen, setModalGourdTypeOpen] = useState(false);
  const [editModalGourdTypeOpen, setEditModalGourdTypeOpen] = useState(false);
  const [selectedGourdType, setSelectedGourdType] = useState(null);
  const [dateError, setDateError] = useState("");

  const [monitoringData, setMonitoringData] = useState({
    gourdType: null,
    dateOfPollination: new Date(),
    pollinatedFlowerImages: [],
    plotNo: "",
  });
  const selectedGourd = gourdTypes.find(g => g._id === monitoringData.gourdType);
  const gourdIdForAPI = monitoringData.gourdType;
  const [modalGourdType, setModalGourdType] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false);
  const [actionSheetForEdit, setActionSheetForEdit] = useState(false);

  // Improved action sheet handler
  const openImageActionSheet = (forEdit = false) => {
    setActionSheetForEdit(forEdit);
    setImageActionSheetVisible(true);
  };

  const closeImageActionSheet = () => setImageActionSheetVisible(false);

  // Enhanced image picker with better error handling
  const handleImageAction = async (type) => {
    closeImageActionSheet();
    try {
      let result;
      if (type === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ type: "error", text1: "Camera permission required" });
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ type: "error", text1: "Gallery access required" });
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets?.[0]?.uri) {
        const target = actionSheetForEdit ? setEditMonitoringData : setMonitoringData;
        target(prev => ({
          ...prev,
          pollinatedFlowerImages: [...(prev.pollinatedFlowerImages || []), result.assets[0].uri]
        }));
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error selecting image", text2: error.message });
    }
  };

  // Data fetching functions
  const fetchGourdData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const { data } = await axios.get(`${baseURL}GourdType`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGourdTypes(data);
    } catch (err) {
      setError("Failed to load gourd types");
      Toast.show({ type: "error", text1: "Network error", text2: "Couldn't fetch gourd types" });
    }
  };

  const fetchMonitoringRecords = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const { data } = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonitorings(data);
    } catch (err) {
      setError("Failed to load records");
      Toast.show({ type: "error", text1: "Network error", text2: "Couldn't fetch monitoring data" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMonitoringRecords();
      fetchGourdData();
      return () => {
        setGourdTypes([]);
        setMonitorings([]);
      };
    }, [userId])
  );

  // Improved date handling
  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisible(null);
    if (selectedDate) {
      const target = editModalVisible ? setEditMonitoringData : setMonitoringData;
      target(prev => ({ ...prev, dateOfPollination: selectedDate }));
      setDateError("");
    }
  };

  // Enhanced monitoring creation with validation
  const addMonitoring = async () => {
    if (!modalGourdType) { // use modalGourdType, not monitoringData.gourdType!
      Toast.show({ type: "error", text1: "Please select a gourd type" });
      return;
    }

    const pollinationDate = new Date(monitoringData.dateOfPollination);
    const harvestDate = new Date(pollinationDate);
    harvestDate.setDate(harvestDate.getDate() + 14);
    const today = new Date();

    if (harvestDate < today) {
      setDateError("Harvest period has already passed for this date");
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwt");
      const formData = new FormData();

      // Use modalGourdType here!
      formData.append("gourdType", modalGourdType);
      formData.append("dateOfPollination", pollinationDate.toISOString());
      formData.append("dateOfHarvestStart", pollinationDate.toISOString());
      formData.append("plotNo", monitoringData.plotNo);

      monitoringData.pollinatedFlowerImages.forEach((uri, index) => {
        const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
        formData.append("pollinatedFlowerImages", {
          uri: normalizedUri,
          type: mime.getType(normalizedUri) || 'image/jpeg',
          name: `flower_${index}.jpg`,
        });
      });

      await axios.post(`${baseURL}Monitoring`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Record created",
        text2: "Monitoring started successfully",
      });

      setMonitoringData({
        gourdType: null,
        dateOfPollination: new Date(),
        pollinatedFlowerImages: [],
        plotNo: "",
      });
      setModalGourdType(null);
      setCreateModalVisible(false);
      fetchMonitoringRecords();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Creation failed",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced delete confirmation
  const deleteMonitoring = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this monitoring record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await AsyncStorage.getItem("jwt");
              await axios.delete(`${baseURL}Monitoring/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setMonitorings(prev => prev.filter(m => m._id !== id));
              Toast.show({ type: "success", text1: "Record deleted" });
            } catch (error) {
              Toast.show({ type: "error", text1: "Delete failed" });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Improved monitoring update
  const updateMonitoring = async () => {
    if (!editMonitoringData) return;
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwt");
      const formData = new FormData();

      formData.append("gourdType", editMonitoringData.gourdType._id);
      formData.append("dateOfPollination", new Date(editMonitoringData.dateOfPollination).toISOString());
      formData.append("plotNo", editMonitoringData.plotNo);
      formData.append("updatedAt", new Date().toISOString());

      const start = new Date(editMonitoringData.dateOfPollination);
      formData.append("dateOfHarvestStart", start.toISOString());

      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + 7 + i);
        formData.append(`dateOfHarvest[${i}][date]`, day.toISOString());
        formData.append(`dateOfHarvest[${i}][notificationStatus]`, false);
      }

      editMonitoringData.pollinatedFlowerImages.forEach((img, index) => {
        if (typeof img === 'string') {
          const normalizedUri = img.startsWith('file://') ? img : `file://${img}`;
          formData.append("pollinatedFlowerImages", {
            uri: normalizedUri,
            type: mime.getType(normalizedUri) || 'image/jpeg',
            name: `flower_${index}.jpg`,
          });
        } else if (img.url) {
          formData.append("pollinatedFlowerImages", JSON.stringify(img));
        }
      });

      const { data } = await axios.put(
        `${baseURL}Monitoring/${editMonitoringData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({ type: "success", text1: "Record updated" });
      setEditModalVisible(false);
      fetchMonitoringRecords();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMonitoringData = () => {
    setMonitoringData({
      gourdType: null, // <--- use null, NOT ""!
      dateOfPollination: new Date(),
      pollinatedFlowerImages: [],
      plotNo: "",
    });
  };

  const handleModalClose = () => {
    if (isLoading) return;
    resetMonitoringData();
    setEditMonitoringData(null);
    setEditModalVisible(false);
    setCreateModalVisible(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitoringRecords();
    await fetchGourdData();
  };

  const isHarvestStarted = (monitoring) => {
    if (!monitoring.dateOfHarvest?.[0]?.date) return false;
    const firstHarvestDate = new Date(monitoring.dateOfHarvest[0].date);
    const today = new Date();
    return firstHarvestDate <= today;
  };

  const filteredMonitorings = monitorings
    .filter(item => selectedGourdType ? item.gourdType?._id === selectedGourdType : true)
    .filter(item => !isHarvestStarted(item));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3baea0" />
        <Text style={styles.loadingText}>Loading your records...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={40} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <EasyButton medium primary onPress={handleRefresh}>
          <Text style={{ color: "white" }}>Try Again</Text>
        </EasyButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loader Modal */}
      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#3baea0" />
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      </Modal>

      {/* Image Action Sheet */}
      <Modal
        transparent
        visible={imageActionSheetVisible}
        animationType="fade"
        onRequestClose={closeImageActionSheet}
      >
        <Pressable style={styles.actionSheetOverlay} onPress={closeImageActionSheet}>
          <Pressable style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Add Image</Text>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => handleImageAction("camera")}
            >
              <Icon name="camera" size={22} color="#3baea0" style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => handleImageAction("gallery")}
            >
              <Icon name="image" size={22} color="#3baea0" style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSheetCancelButton}
              onPress={closeImageActionSheet}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Gourd Type Filter */}
      <View style={styles.filterContainer}>
        <DropDownPicker
          open={GourdTypeOpen}
          value={selectedGourdType}
          items={[
            { label: "All Gourd Types", value: null },
            ...gourdTypes.map(gourd => ({
              label: gourd.name,
              value: gourd._id,
              icon: () => <Icon name="leaf" size={18} color="#3baea0" />
            }))
          ]}
          setOpen={setGourdTypeOpen}
          setValue={setSelectedGourdType}
          placeholder="Filter by gourd type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          disabled={isLoading}
          zIndex={3000}
          zIndexInverse={3000}
        />
      </View>

      {/* Monitoring List */}
      <FlatList
        data={filteredMonitorings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.monitoringCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.gourdType?.name || "Unknown Gourd"}</Text>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "Completed" ? "#2ecc71" :
                      item.status === "Failed" ? "#e74c3c" :
                        item.status === "In Progress" ? "#3498db" : "#f39c12"
                }
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Icon name="calendar" size={16} color="#7f8c8d" />
                <Text style={styles.infoText}>
                  Pollinated: {new Date(item.dateOfPollination).toLocaleDateString()}
                </Text>
              </View>

              {item.plotNo && (
                <View style={styles.infoRow}>
                  <Icon name="map-marker" size={16} color="#7f8c8d" />
                  <Text style={styles.infoText}>Plot: {item.plotNo}</Text>
                </View>
              )}

              {item.pollinatedFlowerImages?.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Pollinated Flowers</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}
                  >
                    {item.pollinatedFlowerImages.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img.url || img }}
                        style={styles.flowerImage}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setEditMonitoringData(item);
                  setEditModalVisible(true);
                }}
                disabled={isLoading}
              >
                <Icon name="edit" size={16} color="white" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteMonitoring(item._id)}
                disabled={isLoading}
              >
                <Icon name="trash" size={16} color="white" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No monitoring records found</Text>
            <Text style={styles.emptySubtext}>
              {selectedGourdType
                ? "Try changing your filter or add a new record"
                : "Add a new monitoring record to get started"
              }
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3baea0"]}
            tintColor="#3baea0"
          />
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          resetMonitoringData();
          setCreateModalVisible(true);
        }}
        disabled={isLoading}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={createModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Monitoring Record</Text>

            <DropDownPicker
              open={modalGourdTypeOpen}
              value={modalGourdType}
              items={gourdTypes.map(gourd => ({
                label: gourd.name,
                value: gourd._id,
                icon: () => <Icon name="leaf" size={18} color="#3baea0" />
              }))}
              setOpen={setModalGourdTypeOpen}
              setValue={setModalGourdType}
              placeholder="Select gourd type"
              style={styles.modalDropdown}
              dropDownContainerStyle={styles.modalDropdownContainer}
              textStyle={styles.dropdownText}
              zIndex={2000}
              zIndexInverse={2000}
            />

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setDatePickerVisible("pollination")}
              disabled={isLoading}
            >
              <Icon name="calendar" size={18} color="#7f8c8d" style={styles.inputIcon} />
              <Text style={styles.dateText}>
                {new Date(monitoringData.dateOfPollination).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {dateError && <Text style={styles.errorText}>{dateError}</Text>}

            <Text style={styles.inputLabel}>Pollinated Flower Images</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {monitoringData.pollinatedFlowerImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.modalImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      setMonitoringData(prev => ({
                        ...prev,
                        pollinatedFlowerImages: prev.pollinatedFlowerImages.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Icon name="times" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => openImageActionSheet(false)}
                disabled={isLoading}
              >
                <Icon name="camera" size={24} color="#3baea0" />
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles.inputLabel}>Plot Number (Optional)</Text>
            <View style={styles.textInputContainer}>
              <Icon name="map-marker" size={18} color="#7f8c8d" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={monitoringData.plotNo}
                onChangeText={(text) => setMonitoringData(prev => ({ ...prev, plotNo: text }))}
                placeholder="Enter plot number"
                placeholderTextColor="#95a5a6"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleModalClose}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={addMonitoring}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Create Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {datePickerVisible === "pollination" && (
          <DateTimePicker
            value={new Date(monitoringData.dateOfPollination)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Monitoring</Text>

            {editMonitoringData && (
              <>
                <DropDownPicker
                  open={editModalGourdTypeOpen}
                  value={editMonitoringData.gourdType?._id || null}
                  items={gourdTypes.map(gourd => ({
                    label: gourd.name,
                    value: gourd._id,
                    icon: () => <Icon name="leaf" size={18} color="#3baea0" />
                  }))}
                  setOpen={setEditModalGourdTypeOpen}
                  setValue={(value) => {
                    setEditMonitoringData(prev => ({
                      ...prev,
                      gourdType: gourdTypes.find(g => g._id === value) || null
                    }));
                  }}
                  placeholder="Select gourd type"
                  style={styles.modalDropdown}
                  dropDownContainerStyle={styles.modalDropdownContainer}
                  textStyle={styles.dropdownText}
                  disabled={isLoading}
                  zIndex={2000}
                  zIndexInverse={2000}
                />

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setDatePickerVisible("editPollination")}
                  disabled={isLoading}
                >
                  <Icon name="calendar" size={18} color="#7f8c8d" style={styles.inputIcon} />
                  <Text style={styles.dateText}>
                    {new Date(editMonitoringData.dateOfPollination).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Pollinated Flower Images</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageScrollView}
                >
                  {editMonitoringData.pollinatedFlowerImages?.map((img, idx) => {
                    const uri = typeof img === 'string' ? img : img?.url;
                    if (!uri) return null;
                    return (
                      <View key={idx} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.modalImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => {
                            setEditMonitoringData(prev => ({
                              ...prev,
                              pollinatedFlowerImages: prev.pollinatedFlowerImages.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <Icon name="times" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => openImageActionSheet(true)}
                    disabled={isLoading}
                  >
                    <Icon name="camera" size={24} color="#3baea0" />
                  </TouchableOpacity>
                </ScrollView>

                <Text style={styles.inputLabel}>Plot Number (Optional)</Text>
                <View style={styles.textInputContainer}>
                  <Icon name="map-marker" size={18} color="#7f8c8d" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editMonitoringData.plotNo}
                    onChangeText={(text) => setEditMonitoringData(prev => ({ ...prev, plotNo: text }))}
                    placeholder="Enter plot number"
                    placeholderTextColor="#95a5a6"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleModalClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={updateMonitoring}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.modalButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {datePickerVisible === "editPollination" && (
          <DateTimePicker
            value={new Date(editMonitoringData?.dateOfPollination || new Date())}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#34495e',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  errorText: {
    marginVertical: 16,
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: 'white',
    borderColor: '#dfe6e9',
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    borderColor: '#dfe6e9',
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 15,
    color: '#2d3436',
  },
  listContainer: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  monitoringCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#636e72',
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 8,
    marginBottom: 8,
  },
  imageScrollView: {
    marginBottom: 12,
  },
  flowerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#636e72',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3baea0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderText: {
    marginTop: 16,
    color: '#2d3436',
    fontSize: 16,
  },
  actionSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  actionSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
  },
  actionSheetIcon: {
    marginRight: 12,
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: '#2d3436',
  },
  actionSheetCancelButton: {
    paddingVertical: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDropdown: {
    backgroundColor: 'white',
    borderColor: '#dfe6e9',
    borderRadius: 8,
    minHeight: 48,
    marginBottom: 16,
  },
  modalDropdownContainer: {
    borderColor: '#dfe6e9',
    borderRadius: 8,
    marginTop: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 15,
    color: '#2d3436',
  },
  inputLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2bec3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: '#2d3436',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#b2bec3',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#3baea0',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MonitoringScreen;