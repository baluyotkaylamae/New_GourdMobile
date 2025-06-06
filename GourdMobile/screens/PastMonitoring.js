import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Button, Image, ScrollView, Pressable } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../assets/common/baseurl';
import AuthGlobal from '../Context/Store/AuthGlobal';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from "react-native-vector-icons/FontAwesome";

const MonitoringTab = ({ data, onUpdate, onupdate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectupdateem, setSelectupdateem] = useState(null);
  const [harvestInput, setHarvestInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gourdTypes, setGourdTypes] = useState([]);
  const [selectedGourdType, setSelectedGourdType] = useState(null);
  const [gourdTypeOpen, setGourdTypeOpen] = useState(false);

  useEffect(() => {
    const fetchGourdTypes = async () => {
      const storedToken = await AsyncStorage.getItem("jwt");
      try {
        const res = await axios.get(`${baseURL}GourdType`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setGourdTypes(res.data);
      } catch (err) {
        // handle error if needed
      }
    };
    fetchGourdTypes();
  }, []);

  const handleOpenModal = (item) => {
    setSelectupdateem(item);
    setHarvestInput(String(item.fruitsHarvested));
    setErrorMessage("");
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (selectupdateem && harvestInput) {
      if (parseInt(harvestInput) > selectupdateem.pollinatedFlowers) {
        setErrorMessage("Fruits harvested cannot be equal to or greater than pollinated flowers.");
        return;
      }
      await onUpdate(selectupdateem._id, harvestInput);
      setModalVisible(false);
    }
  };

  return (
    <>
      <View style={{ zIndex: 3000, margin: 10 }}>
        <DropDownPicker
          open={gourdTypeOpen}
          value={selectedGourdType}
          items={[
            { label: "All", value: null },
            ...gourdTypes.map((gourd) => ({
              label: gourd.name,
              value: gourd._id,
            })),
          ]}
          setOpen={setGourdTypeOpen}
          setValue={setSelectedGourdType}
          placeholder="Select Gourd Type"
          style={styles.input}
          dropDownStyle={styles.dropdown}
        />
      </View>
      <FlatList
        data={
          selectedGourdType
            ? data.filter(item => item.gourdType && item.gourdType._id === selectedGourdType)
            : data
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.gourdType?.name || "No Gourd Type"}</Text>
            <Text style={styles.description}>Plot No: {item.plotNo || "N/A"}</Text>
            <Text style={styles.description}>
              Flowers Pollinated: {item.pollinatedFlowerImages ? item.pollinatedFlowerImages.length : 0}
            </Text>
            <Text style={styles.description}>
              Fruits Harvested: {item.fruitHarvestedImages ? item.fruitHarvestedImages.length : 0}
            </Text>
            <Text style={styles.description}>
              Date of Pollination: {item.dateOfPollination ? new Date(item.dateOfPollination).toLocaleDateString() : "N/A"}
            </Text>
            <Text style={styles.description}>
              Date of Finalization:{" "}
              {item.dateOfHarvest && item.dateOfHarvest.length >= 7
                ? `Day 1: ${new Date(item.dateOfHarvest[0].date).toLocaleDateString()} | Day 7: ${new Date(item.dateOfHarvest[6].date).toLocaleDateString()}`
                : "N/A"}
            </Text>
            <Text style={[
              styles.description,
              item.status === "In Progress" && { color: "orange" },
              item.status === "Completed" && { color: "green" },
              item.status === "Failed" && { color: "red" },
            ]}>
              {item.status}
            </Text>

            {/* Pollinated Flower Images */}
            {item.pollinatedFlowerImages && item.pollinatedFlowerImages.length > 0 && (
              <View style={styles.imageRow}>
                <Text style={styles.imageLabel}>Pollinated Flowers:</Text>
                <View style={styles.imageContainer}>
                  {item.pollinatedFlowerImages.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img.url || img }}
                      style={styles.imagePreview}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Harvested Fruit Images */}
            {item.fruitHarvestedImages && item.fruitHarvestedImages.length > 0 && (
              <View style={styles.imageRow}>
                <Text style={styles.imageLabel}>Harvested Fruits:</Text>
                <View style={styles.imageContainer}>
                  {item.fruitHarvestedImages.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img.url || img }}
                      style={styles.imagePreview}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.iconContainer}>
              {/* Hide update if completed and all harvested */}
              {!(
                item.status === 'Completed' &&
                item.fruitHarvestedImages &&
                item.pollinatedFlowerImages &&
                item.fruitHarvestedImages.length === item.pollinatedFlowerImages.length
              ) && (
                  <>
                    {item.status === 'In Progress' && (

                      <TouchableOpacity
                        style={[styles.updateButton, { backgroundColor: '#FFA500', marginLeft: 10 }, styles.icon]}
                        onPress={() => onupdate(item)}
                      >
                        <Text style={styles.updateButtonText}>Update</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id}
      />
      {/* Modal code remains unchanged */}
    </>
  );
};

const PastMonitoring = () => {
  const context = useContext(AuthGlobal);
  const [monitoringData, setMonitoringData] = useState([]);
  const [pastMonitoringData, setPastMonitoringData] = useState([]);
  const [failedMonitoringData, setFailedMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('current');

  // update modal state
  const [updateModalVisible, setupdateModalVisible] = useState(false);
  const [updateData, setupdateData] = useState(null);
  const [updatePlotNo, setupdatePlotNo] = useState('');
  const [updatePollinatedImages, setupdatePollinatedImages] = useState([]);
  const [updateHarvestedImages, setupdateHarvestedImages] = useState([]);

  // Add for modern action sheet and loading
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const userId = context.stateUser?.user?.userId;
      const response = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

      const currentData = response.data.filter(item => {
        if (!item.dateOfHarvest || item.dateOfHarvest.length < 7) return false;

        // Check if today matches any of the 7 harvest days (UTC, date only)
        return item.dateOfHarvest.slice(0, 7).some(harvestObj => {
          const harvestDate = new Date(harvestObj.date);
          const harvestUTC = new Date(Date.UTC(harvestDate.getUTCFullYear(), harvestDate.getUTCMonth(), harvestDate.getUTCDate()));
          return harvestUTC.getTime() === todayUTC.getTime();
        });
      });

      setMonitoringData(currentData);
      setPastMonitoringData([]);
      setFailedMonitoringData([]);
    } catch (error) {
      setError(error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMonitoringData();
    }, [context.stateUser])
  );

  const onUpdate = async (id, fruitsHarvested) => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem("jwt");
      await axios.put(
        `${baseURL}Monitoring/${id}`,
        { fruitsHarvested },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      fetchMonitoringData();
    } catch (error) {
      console.error("Error updating monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // update modal handlers
  const handleupdate = (item) => {
    setupdateData(item);
    setupdatePlotNo(item.plotNo || '');
    setupdatePollinatedImages(item.pollinatedFlowerImages || []);
    setupdateHarvestedImages(item.fruitHarvestedImages || []);
    setupdateModalVisible(true);
  };

  // Modern custom action sheet for image picking
  const openImageActionSheet = () => setImageActionSheetVisible(true);
  const closeImageActionSheet = () => setImageActionSheetVisible(false);

  // Modern camera/gallery picker
  const pickImage = async (type) => {
    closeImageActionSheet();
    setIsLoading(true);
    try {
      if (type === "camera") {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          alert("Camera permission denied");
          return;
        }
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          // Limit: do not allow more harvested images than pollinated flowers
          if (updateData && updateHarvestedImages.length >= updateData.pollinatedFlowers) {
            alert("You cannot add more harvested fruit images than pollinated flowers.");
            return;
          }
          setupdateHarvestedImages(prev => [...prev, result.assets[0].uri]);
        }
      } else if (type === "gallery") {
        const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPerm.granted) {
          alert("Media library permission denied");
          return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          // Limit: do not allow more harvested images than pollinated flowers
          if (updateData && updateHarvestedImages.length >= updateData.pollinatedFlowers) {
            alert("You cannot add more harvested fruit images than pollinated flowers.");
            return;
          }
          setupdateHarvestedImages(prev => [...prev, result.assets[0].uri]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveupdate = async () => {
    if (!updateData) return;
    if (updateHarvestedImages.length > updateData.pollinatedFlowers) {
      alert("Number of harvested fruit images cannot exceed pollinated flowers.");
      return;
    }

    setIsLoading(true);

    const storedToken = await AsyncStorage.getItem("jwt");
    let formData = new FormData();
    formData.append("plotNo", updatePlotNo);

    // Only update fruitHarvestedImages!
    // 1. Add existing harvested images (those with http/https) as plain values
    updateHarvestedImages.forEach((imageObj) => {
      if (typeof imageObj === 'object' && imageObj.url && imageObj.url.startsWith("http")) {
        formData.append("fruitHarvestedImages", JSON.stringify(imageObj));
      }
    });
    // 2. Add new harvested images (local URIs) as files
    updateHarvestedImages.forEach((imageUri, index) => {
      const uri = typeof imageUri === 'string' ? imageUri : imageUri?.url;
      if (uri && !uri.startsWith("http")) {
        const newImageUri = `file:///${uri.split("file:/").join("")}`;
        formData.append("fruitHarvestedImages", {
          uri: newImageUri,
          type: mime.getType(newImageUri) || 'image/jpeg',
          name: `fruit_harvested_${index}.jpg`,
        });
      }
    });

    // If number of images == pollinatedFlowers, set status to Completed
    if (
      updateHarvestedImages.length === Number(updateData.pollinatedFlowers)
    ) {
      formData.append("status", "Completed");
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedToken}`,
        },
      };
      await axios.put(`${baseURL}Monitoring/${updateData._id}`, formData, config);
      setupdateModalVisible(false);
      setupdateData(null);
      setupdateHarvestedImages([]);
      fetchMonitoringData();
    } catch (error) {
      console.error("Error updating monitoring:", error);
      alert("Error updating monitoring. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    loading ? <ActivityIndicator size="large" color="#0000ff" /> :
      error ? <Text>{error}</Text> :
        <View style={styles.container}>
          {/* Loading overlay for all update actions */}
          <Modal
            visible={isLoading}
            transparent
            animationType="fade"
            onRequestClose={() => {}}
          >
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#3baea0" />
              <Text style={{marginTop: 15, color: "#333"}}>Processing...</Text>
            </View>
          </Modal>

          {/* Removed tab buttons here */}
          {selectedTab === 'current' ? (
            <MonitoringTab data={monitoringData} onUpdate={onUpdate} onupdate={handleupdate} />
          ) : selectedTab === 'past' ? (
            <MonitoringTab data={pastMonitoringData} onUpdate={onUpdate} onupdate={handleupdate} />
          ) : (
            <MonitoringTab data={failedMonitoringData} onUpdate={onUpdate} onupdate={handleupdate} />
          )}

          {/* Modern Custom Action Sheet for Add Image */}
          <Modal
            visible={imageActionSheetVisible}
            transparent
            animationType="fade"
            onRequestClose={closeImageActionSheet}
          >
            <Pressable style={styles.actionSheetOverlay} onPress={closeImageActionSheet}>
              <Pressable style={styles.actionSheetContainer}>
                <Text style={styles.actionSheetTitle}>Add Image</Text>
                <TouchableOpacity style={styles.actionSheetButton} onPress={() => pickImage("camera")}>
                  <Icon name="camera" size={22} color="#3baea0" style={{ marginRight: 10 }} />
                  <Text style={styles.actionSheetButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionSheetButton} onPress={() => pickImage("gallery")}>
                  <Icon name="image" size={22} color="#3baea0" style={{ marginRight: 10 }} />
                  <Text style={styles.actionSheetButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionSheetButton, {borderTopWidth: 1, borderColor: "#eee"}]} onPress={closeImageActionSheet}>
                  <Text style={[styles.actionSheetButtonText, { color: "#d00" }]}>Cancel</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          {/* update Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={updateModalVisible}
            onRequestClose={() => setupdateModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {updateData && (
                  <>
                    <Text style={styles.modalTitle}>Update Monitoring</Text>
                    <Text>Harvested Fruit Images</Text>
                    <ScrollView horizontal style={{ marginVertical: 5 }}>
                      {(updateHarvestedImages || []).map((image, idx) => {
                        const uri = typeof image === 'string' ? image : image?.url;
                        if (!uri) return null;
                        return (
                          <View key={idx} style={{ position: 'relative', marginRight: 10 }}>
                            <Image source={{ uri }} style={styles.imagePreview} />
                            <TouchableOpacity
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                borderRadius: 10,
                                width: 20,
                                height: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onPress={() => {
                                setupdateHarvestedImages(prev =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              <Text style={{ color: 'white', fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                      {/* Only show the add button if limit not reached */}
                      {updateHarvestedImages.length < (updateData.pollinatedFlowerImages ? updateData.pollinatedFlowerImages.length : 0) && (
                        <TouchableOpacity
                          style={styles.addImageIconButton}
                          onPress={openImageActionSheet}
                          disabled={isLoading}
                        >
                          <Icon name="camera" size={28} color="#555" />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                    <Text style={styles.monitoringDetail}>
                      Fruits Harvested: {updateHarvestedImages.length}
                    </Text>
                    <View style={styles.modalButtons}>
                      <Button
                        title="Save"
                        onPress={saveupdate}
                        color="green"
                        disabled={isLoading}
                      />
                      <View style={{ width: 10 }} />
                      <Button title="Cancel" onPress={() => setupdateModalVisible(false)} color="red" disabled={isLoading} />
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007BFF',
  },
  tabButtonText: {
    color: '#000',
  },
  monitoringCard: {
    marginTop: 10,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monitoringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monitoringDetail: {
    fontSize: 14,
    marginVertical: 2,
  },
  updateButton: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '95%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  addImageIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#bbb",
  },
  uploadButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
  },
  uploadText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  item: {
    backgroundColor: "white",
    margin: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    color: "gray",
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  icon: {
    marginLeft: 10,
  },
  imageRow: {
    marginTop: 10,
    marginBottom: 5,
  },
  imageLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  // Modern Custom Action Sheet
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  actionSheetTitle: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  actionSheetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: "#1F2937",
  },
});

export default PastMonitoring;