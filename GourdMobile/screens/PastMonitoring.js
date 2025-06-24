import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Image, 
  ScrollView, 
  Pressable,
  RefreshControl,
  Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../assets/common/baseurl';
import AuthGlobal from '../Context/Store/AuthGlobal';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from "react-native-vector-icons/FontAwesome";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

const PastMonitoring = () => {
  const context = useContext(AuthGlobal);
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState(null);
  const [updatePlotNo, setUpdatePlotNo] = useState('');
  const [updatePollinatedImages, setUpdatePollinatedImages] = useState([]);
  const [updateHarvestedImages, setUpdateHarvestedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false);
  const [gourdTypes, setGourdTypes] = useState([]);
  const [selectedGourdType, setSelectedGourdType] = useState(null);
  const [gourdTypeOpen, setGourdTypeOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGourdTypes = async () => {
    const storedToken = await AsyncStorage.getItem("jwt");
    try {
      const res = await axios.get(`${baseURL}GourdType`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setGourdTypes(res.data);
    } catch (err) {
      console.error("Error fetching gourd types:", err);
    }
  };

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      const userId = context.stateUser?.user?.userId;
      const response = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      // Filter records that are within their harvest period
      const filteredData = response.data.filter(item => {
        if (!item.dateOfHarvest || item.dateOfHarvest.length < 7) return false;
        
        const firstHarvestDate = new Date(item.dateOfHarvest[0].date);
        firstHarvestDate.setHours(0, 0, 0, 0);
        
        const lastHarvestDate = new Date(item.dateOfHarvest[6].date);
        lastHarvestDate.setHours(0, 0, 0, 0);
        
        // Only show records where today is between first and last harvest date
        return today >= firstHarvestDate && today <= lastHarvestDate;
      });

      setMonitoringData(filteredData);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMonitoringData();
      fetchGourdTypes();
    }, [context.stateUser])
  );

  const handleUpdate = (item) => {
    setUpdateData(item);
    setUpdatePlotNo(item.plotNo || '');
    setUpdatePollinatedImages(item.pollinatedFlowerImages || []);
    setUpdateHarvestedImages(item.fruitHarvestedImages || []);
    setUpdateModalVisible(true);
  };

  const openImageActionSheet = () => setImageActionSheetVisible(true);
  const closeImageActionSheet = () => setImageActionSheetVisible(false);

  const pickImage = async (type) => {
    closeImageActionSheet();
    setIsLoading(true);
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
        if (updateData && updateHarvestedImages.length >= (updateData.pollinatedFlowerImages?.length || 0)) {
          Toast.show({ 
            type: "error", 
            text1: "Limit reached",
            text2: "Cannot add more harvested fruits than pollinated flowers" 
          });
          return;
        }
        setUpdateHarvestedImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to select image" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveUpdate = async () => {
    if (!updateData) return;
    if (updateHarvestedImages.length > (updateData.pollinatedFlowerImages?.length || 0)) {
      Toast.show({ 
        type: "error", 
        text1: "Invalid count",
        text2: "Harvested fruits cannot exceed pollinated flowers" 
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwt");
      const formData = new FormData();
      
      formData.append("plotNo", updatePlotNo);

      // Add existing images
      updateHarvestedImages.forEach(img => {
        if (typeof img === 'object' && img.url?.startsWith("http")) {
          formData.append("fruitHarvestedImages", JSON.stringify(img));
        }
      });
      
      // Add new images
      updateHarvestedImages.forEach((img, index) => {
        const uri = typeof img === 'string' ? img : img?.url;
        if (uri && !uri.startsWith("http")) {
          const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
          formData.append("fruitHarvestedImages", {
            uri: normalizedUri,
            type: mime.getType(normalizedUri) || 'image/jpeg',
            name: `fruit_${index}.jpg`,
          });
        }
      });

      // Update status if completed
      if (updateHarvestedImages.length === (updateData.pollinatedFlowerImages?.length || 0)) {
        formData.append("status", "Completed");
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.put(`${baseURL}Monitoring/${updateData._id}`, formData, config);
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Monitoring updated successfully",
      });
      
      setUpdateModalVisible(false);
      fetchMonitoringData();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to update monitoring",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitoringData();
    await fetchGourdTypes();
    setRefreshing(false);
  };

  const filteredData = selectedGourdType
    ? monitoringData.filter(item => item.gourdType && item.gourdType._id === selectedGourdType)
    : monitoringData;

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMonitoringData}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
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
            <Text style={styles.actionSheetTitle}>Add Harvest Image</Text>
            <TouchableOpacity 
              style={styles.actionSheetButton}
              onPress={() => pickImage("camera")}
            >
              <Icon name="camera" size={22} color="#3baea0" style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionSheetButton}
              onPress={() => pickImage("gallery")}
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
          open={gourdTypeOpen}
          value={selectedGourdType}
          items={[
            { label: "All Gourd Types", value: null, icon: () => <Icon name="leaf" size={16} color="#3baea0" /> },
            ...gourdTypes.map((gourd) => ({
              label: gourd.name,
              value: gourd._id,
              icon: () => <Icon name="leaf" size={16} color="#3baea0" />
            })),
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

      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <View style={styles.monitoringCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.gourdType?.name || "No Gourd Type"}</Text>
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
                <Icon name="map-marker" size={14} color="#7f8c8d" />
                <Text style={styles.infoText}>Plot: {item.plotNo || "N/A"}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="calendar" size={14} color="#7f8c8d" />
                <Text style={styles.infoText}>
                  Pollinated: {item.dateOfPollination ? new Date(item.dateOfPollination).toLocaleDateString() : "N/A"}
                </Text>
              </View>
              
              <View style={styles.harvestDatesContainer}>
                <Text style={styles.sectionTitle}>Harvest Period:</Text>
                {item.dateOfHarvest && item.dateOfHarvest.length >= 7 && (
                  <>
                    <Text style={styles.harvestDate}>
                      Start: {new Date(item.dateOfHarvest[0].date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.harvestDate}>
                      End: {new Date(item.dateOfHarvest[6].date).toLocaleDateString()}
                    </Text>
                  </>
                )}
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Icon name="pagelines" size={16} color="#3baea0" />
                  <Text style={styles.statText}>
                    {item.pollinatedFlowerImages ? item.pollinatedFlowerImages.length : 0}
                  </Text>
                  <Text style={styles.statLabel}>Flowers</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="apple" size={16} color="#3baea0" />
                  <Text style={styles.statText}>
                    {item.fruitHarvestedImages ? item.fruitHarvestedImages.length : 0}
                  </Text>
                  <Text style={styles.statLabel}>Fruits</Text>
                </View>
              </View>
              
              {/* Pollinated Flower Images */}
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
                        key={`pollinated-${idx}`}
                        source={{ uri: img.url || img }}
                        style={styles.flowerImage}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
              
              {/* Harvested Fruit Images */}
              {item.fruitHarvestedImages?.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Harvested Fruits</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}
                  >
                    {item.fruitHarvestedImages.map((img, idx) => (
                      <Image
                        key={`harvested-${idx}`}
                        source={{ uri: img.url || img }}
                        style={styles.flowerImage}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
            
            {/* Action Buttons */}
            {!(
              item.status === 'Completed' &&
              item.fruitHarvestedImages &&
              item.pollinatedFlowerImages &&
              item.fruitHarvestedImages.length === item.pollinatedFlowerImages.length
            ) && (
              <View style={styles.cardFooter}>
                {item.status === 'In Progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleUpdate(item)}
                  >
                    <Icon name="edit" size={16} color="white" />
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3baea0"]}
            tintColor="#3baea0"
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No monitoring records found</Text>
            <Text style={styles.emptySubtext}>
              {selectedGourdType 
                ? "Try changing your filter"
                : "No active monitoring records within harvest dates"
              }
            </Text>
          </View>
        }
      />

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {updateData && (
              <>
                <Text style={styles.modalTitle}>Update Harvest</Text>
                
                <View style={styles.infoRow}>
                  <Icon name="leaf" size={16} color="#3baea0" />
                  <Text style={styles.infoText}>{updateData.gourdType?.name || "Unknown"}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Icon name="map-marker" size={16} color="#3baea0" />
                  <TextInput
                    style={styles.textInput}
                    value={updatePlotNo}
                    onChangeText={setUpdatePlotNo}
                    placeholder="Plot number"
                    placeholderTextColor="#95a5a6"
                  />
                </View>
                
                <Text style={styles.sectionTitle}>Harvested Fruits</Text>
                <Text style={styles.countText}>
                  {updateHarvestedImages.length} of {updateData.pollinatedFlowerImages?.length || 0}
                </Text>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageScrollView}
                >
                  {updateHarvestedImages.map((img, idx) => {
                    const uri = typeof img === 'string' ? img : img?.url;
                    if (!uri) return null;
                    return (
                      <View key={idx} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.modalImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => {
                            setUpdateHarvestedImages(prev =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                        >
                          <Icon name="times" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {updateHarvestedImages.length < (updateData.pollinatedFlowerImages?.length || 0) && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={openImageActionSheet}
                      disabled={isLoading}
                    >
                      <Icon name="camera" size={24} color="#3baea0" />
                    </TouchableOpacity>
                  )}
                </ScrollView>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setUpdateModalVisible(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveUpdate}
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
  retryButton: {
    backgroundColor: '#3baea0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    paddingBottom: 16,
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
  harvestDatesContainer: {
    marginVertical: 8,
  },
  harvestDate: {
    fontSize: 14,
    color: '#636e72',
    marginLeft: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dfe6e9',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
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
  textInput: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#dfe6e9',
    marginLeft: 8,
    paddingVertical: 8,
    color: '#2d3436',
  },
  countText: {
    textAlign: 'center',
    color: '#3baea0',
    fontWeight: 'bold',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#b2bec3',
  },
  saveButton: {
    backgroundColor: '#3baea0',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PastMonitoring;