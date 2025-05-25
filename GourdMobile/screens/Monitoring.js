import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity, Image, TextInput } from "react-native";
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
  const [editModalGourdTypeOpen, setEditModalGourdTypeOpen] = useState(false); // modal dropdown
  const [selectedGourdType, setSelectedGourdType] = useState(null);
  const [dateError, setDateError] = useState("");
  const [monitoringData, setMonitoringData] = useState({
    gourdType: "",
    dateOfPollination: new Date(),
    pollinatedFlowerImages: [],
    plotNo: "",
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMonitoringData((prev) => ({
        ...prev,
        pollinatedFlowerImages: [...(prev.pollinatedFlowerImages || []), result.assets[0].uri],
      }));
    }
  };

  const pickEditImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditMonitoringData((prev) => ({
        ...prev,
        pollinatedFlowerImages: [
          ...(prev.pollinatedFlowerImages || []),
          result.assets[0].uri,
        ],
      }));
    }
  };

  const fetchGourdData = async () => {
    const storedToken = await AsyncStorage.getItem("jwt");
    try {
      const gourdTypesResponse = await axios.get(`${baseURL}GourdType`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setGourdTypes(gourdTypesResponse.data);
    } catch (err) {
      setError("Error fetching gourd types");
    }
  };

  const fetchMonitoringRecords = async () => {
    const storedToken = await AsyncStorage.getItem("jwt");
    try {
      const monitoringResponse = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setMonitorings(monitoringResponse.data);
    } catch (err) {
      setError("Failed to fetch monitoring records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      setError(null);
      fetchMonitoringRecords();
      fetchGourdData();

      return () => {
        setGourdTypes([]);
        setMonitorings([]);
      };
    }, [userId])
  );

  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisible(null);
    if (selectedDate) {
      setMonitoringData((prevState) => ({
        ...prevState,
        dateOfPollination: selectedDate,
      }));
      setDateError("");
    }
  };

  const addMonitoring = async () => {
    setDateError(""); // Reset error
    if (!monitoringData.gourdType) {
      Toast.show({ type: "error", text1: "Please select a gourd type." });
      return;
    }

    const pollinationDate = new Date(monitoringData.dateOfPollination);
    const day7Harvest = new Date(pollinationDate);
    day7Harvest.setDate(day7Harvest.getDate() + 14);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (day7Harvest < today) {
      setDateError("The last harvest day is already past. Please select a more recent pollination date.");
      return;
    }

    const storedToken = await AsyncStorage.getItem("jwt");
    if (!storedToken) {
      Toast.show({ type: "error", text1: "No token found." });
      return;
    }

    let formData = new FormData();
    formData.append("gourdType", monitoringData.gourdType._id);
    formData.append("dateOfPollination", monitoringData.dateOfPollination ? new Date(monitoringData.dateOfPollination).toISOString() : new Date().toISOString());
    formData.append("dateOfHarvestStart", monitoringData.dateOfPollination ? new Date(monitoringData.dateOfPollination).toISOString() : new Date().toISOString());
    formData.append("plotNo", monitoringData.plotNo);

    (monitoringData.pollinatedFlowerImages || []).forEach((imageUri, index) => {
      if (imageUri) {
        const newImageUri = `file:///${imageUri.split("file:/").join("")}`;
        formData.append("pollinatedFlowerImages", {
          uri: newImageUri,
          type: mime.getType(newImageUri) || 'image/jpeg',
          name: `pollinated_flower_${index}.jpg`,
        });
      }
    });

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedToken}`,
        },
      };

      const res = await axios.post(`${baseURL}Monitoring`, formData, config);
      if (res.status === 201) {
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "Monitoring Record Created",
          text2: "Your monitoring data has been saved.",
        });

        setMonitoringData({
          gourdType: "",
          dateOfPollination: new Date(),
          pollinatedFlowerImages: [],
          plotNo: "",
        });

        setTimeout(() => {
          setCreateModalVisible(false);
          fetchMonitoringRecords();
        }, 500);
      }
    } catch (error) {
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Error Adding Monitoring Record",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  };

  const deleteMonitoring = async (id) => {
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      await axios.delete(`${baseURL}Monitoring/${id}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setMonitorings(monitorings.filter((monitoring) => monitoring._id !== id));
      Alert.alert("Success", "Monitoring deleted successfully");
    } catch (err) {
      setError("Error deleting monitoring");
    }
  };

  const resetMonitoringData = () => {
    setMonitoringData({
      gourdType: "",
      dateOfPollination: new Date(),
      pollinatedFlowerImages: [],
      plotNo: "",
    });
  };

  const handleModalClose = () => {
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

  const confirmDeleteMonitoring = (id) => {
    Alert.alert(
      "Delete Monitoring",
      "Are you sure you want to delete this monitoring?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => deleteMonitoring(id), style: "destructive" }
      ],
      { cancelable: true }
    );
  };

  // Update monitoring record
  const updateMonitoring = async () => {
    if (!editMonitoringData) return;

    const storedToken = await AsyncStorage.getItem("jwt");
    let formData = new FormData();

    formData.append("gourdType", editMonitoringData.gourdType._id);
    formData.append("dateOfPollination", new Date(editMonitoringData.dateOfPollination).toISOString());
    formData.append("plotNo", editMonitoringData.plotNo);

    // Recalculate dateOfHarvestStart and dateOfHarvest (7 days)
    const start = new Date(editMonitoringData.dateOfPollination);
    formData.append("dateOfHarvestStart", start.toISOString());

    // Add this block to update dateOfHarvest array
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + 7 + i);
      formData.append(`dateOfHarvest[${i}][date]`, day.toISOString());
      formData.append(`dateOfHarvest[${i}][notificationStatus]`, false);
    }
    // Send all images: existing (URLs) and new (local files)
    (editMonitoringData.pollinatedFlowerImages || []).forEach((imageObj, index) => {
      if (typeof imageObj === 'object' && imageObj.url && imageObj.url.startsWith("http")) {
        formData.append("pollinatedFlowerImages", JSON.stringify(imageObj));
      } else if (typeof imageObj === 'string' && imageObj.startsWith("http")) {
        formData.append("pollinatedFlowerImages", JSON.stringify({ url: imageObj }));
      } else if (typeof imageObj === 'string') {
        const newImageUri = `file:///${imageObj.split("file:/").join("")}`;
        formData.append("pollinatedFlowerImages", {
          uri: newImageUri,
          type: mime.getType(newImageUri) || 'image/jpeg',
          name: `pollinated_flower_${index}.jpg`,
        });
      }
    });

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${storedToken}`,
        },
      };
      const res = await axios.put(`${baseURL}Monitoring/${editMonitoringData._id}`, formData, config);
      if (res.status === 200) {
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "Monitoring Updated",
        });
        setEditModalVisible(false);
        setEditMonitoringData(null);
        fetchMonitoringRecords();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error updating monitoring",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  const isHarvestStarted = (monitoring) => {
    if (!monitoring.dateOfHarvest || !Array.isArray(monitoring.dateOfHarvest) || monitoring.dateOfHarvest.length === 0) return false;
    const day1 = new Date(monitoring.dateOfHarvest[0].date);
    const today = new Date();
    // Compare only the date part (ignore time)
    return (
      day1.getFullYear() < today.getFullYear() ||
      (day1.getFullYear() === today.getFullYear() && day1.getMonth() < today.getMonth()) ||
      (day1.getFullYear() === today.getFullYear() && day1.getMonth() === today.getMonth() && day1.getDate() <= today.getDate())
    );
  };

  // 2. Then use it in filteredMonitorings
  const filteredMonitorings = (selectedGourdType
    ? monitorings.filter((item) => item.gourdType._id === selectedGourdType)
    : monitorings
  ).filter(item => !isHarvestStarted(item));


  return (
    <View style={{ backgroundColor: "#F0F0F0", flex: 1 }}>
      <View style={{ zIndex: 3000, margin: 10 }}>
        <DropDownPicker
          open={GourdTypeOpen}
          value={selectedGourdType}
          items={[
            { label: "All", value: null },
            ...gourdTypes.map((gourd) => ({
              label: gourd.name,
              value: gourd._id,
            })),
          ]}
          setOpen={setGourdTypeOpen}
          setValue={(callbackOrValue) => {
            const value = typeof callbackOrValue === "function"
              ? callbackOrValue(selectedGourdType)
              : callbackOrValue;
            setSelectedGourdType(value);
          }}
          placeholder="Select Gourd Type"
          style={styles.input}
          dropDownStyle={styles.dropdown}
        />
      </View>

      <FlatList
        data={filteredMonitorings}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.gourdType?.name || "Unknown"}
            </Text>
            <Text style={styles.description}>
              Pollination: {new Date(item.dateOfPollination).toDateString()}
            </Text>
            <Text style={styles.description}>
              Plot No: {item.plotNo || "N/A"}
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

            {/* Harvested Fruits images are hidden here */}

            <View style={styles.iconContainer}>
              <EasyButton
                primary
                medium
                onPress={() => {
                  setEditMonitoringData(item);
                  setEditModalVisible(true);
                }}
                style={styles.icon}
              >
                <Icon name="pencil" size={20} color="white" />
              </EasyButton>
              <EasyButton
                danger
                medium
                onPress={() => confirmDeleteMonitoring(item._id)}
                style={styles.icon}
              >
                <Icon name="trash" size={20} color="white" />
              </EasyButton>
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          resetMonitoringData();
          setCreateModalVisible(true);
        }}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ zIndex: 2000 }}>
              <DropDownPicker
                open={modalGourdTypeOpen}
                value={monitoringData.gourdType ? monitoringData.gourdType._id : null}
                items={gourdTypes.map((gourd) => ({
                  label: gourd.name,
                  value: gourd._id,
                }))}
                setOpen={setModalGourdTypeOpen}
                setValue={(callbackOrValue) => {
                  const value = typeof callbackOrValue === "function"
                    ? callbackOrValue(monitoringData.gourdType ? monitoringData.gourdType._id : null)
                    : callbackOrValue;
                  setMonitoringData((prevState) => ({
                    ...prevState,
                    gourdType: gourdTypes.find((gourd) => gourd._id === value),
                  }));
                }}
                placeholder="Select Gourd Type"
                style={styles.input}
                dropDownStyle={styles.dropdown}
              />
            </View>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setDatePickerVisible("pollination")}
            >
              <Text>{new Date(monitoringData.dateOfPollination).toDateString()}</Text>
            </TouchableOpacity>
            {dateError ? (
              <Text style={{ color: "red", marginBottom: 10 }}>{dateError}</Text>
            ) : null}

            <Text>Pollinated Flower Images</Text>
            <View style={styles.imageContainer}>
              {monitoringData.pollinatedFlowerImages?.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.imagePreview} />
              ))}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadText}>+ Add Image</Text>
              </TouchableOpacity>
            </View>

            <Text>Plot No</Text>
            <TextInput
              style={styles.input}
              value={monitoringData.plotNo}
              onChangeText={(text) => setMonitoringData({ ...monitoringData, plotNo: text })}
              placeholder="Enter Plot No"
            />

            <View style={styles.buttonRow}>
              <EasyButton medium primary onPress={addMonitoring}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Create</Text>
              </EasyButton>
              <EasyButton medium style={styles.cancelButton} onPress={handleModalClose}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
              </EasyButton>
            </View>
          </View>
        </View>
        {datePickerVisible && (
          <DateTimePicker
            value={monitoringData.dateOfPollination}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {editMonitoringData && (
              <>
                <Text style={styles.itemText}>Edit Monitoring</Text>
                {/* Gourd Type Picker */}
                <DropDownPicker
                  open={editModalGourdTypeOpen}
                  value={editMonitoringData.gourdType ? editMonitoringData.gourdType._id : null}
                  items={gourdTypes.map((gourd) => ({
                    label: gourd.name,
                    value: gourd._id,
                  }))}
                  setOpen={setEditModalGourdTypeOpen}
                  setValue={(callbackOrValue) => {
                    const value = typeof callbackOrValue === "function"
                      ? callbackOrValue(editMonitoringData.gourdType ? editMonitoringData.gourdType._id : null)
                      : callbackOrValue;
                    setEditMonitoringData((prevState) => ({
                      ...prevState,
                      gourdType: gourdTypes.find((gourd) => gourd._id === value),
                    }));
                  }}
                  placeholder="Select Gourd Type"
                  style={styles.input}
                  dropDownStyle={styles.dropdown}
                />
                {/* Date of Pollination Picker */}
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setDatePickerVisible("editPollination")}
                >
                  <Text>{new Date(editMonitoringData.dateOfPollination).toDateString()}</Text>
                </TouchableOpacity>
                {datePickerVisible === "editPollination" && (
                  <DateTimePicker
                    value={new Date(editMonitoringData.dateOfPollination)}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setDatePickerVisible(null);
                      if (selectedDate) {
                        setEditMonitoringData((prevState) => ({
                          ...prevState,
                          dateOfPollination: selectedDate,
                        }));
                      }
                    }}
                  />
                )}

                {/* Pollinated Flower Images */}
                <Text>Pollinated Flower Images</Text>
                <View style={styles.imageContainer}>
                  {(editMonitoringData.pollinatedFlowerImages || []).map((image, idx) => {
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
                            setEditMonitoringData(prev => ({
                              ...prev,
                              pollinatedFlowerImages: prev.pollinatedFlowerImages.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <TouchableOpacity style={styles.uploadButton} onPress={pickEditImage}>
                    <Text style={styles.uploadText}>+ Add Image</Text>
                  </TouchableOpacity>
                </View>

                {/* Plot No (optional, remove if not needed) */}
                <Text>Plot No</Text>
                <TextInput
                  style={styles.input}
                  value={editMonitoringData.plotNo}
                  onChangeText={(text) => setEditMonitoringData({ ...editMonitoringData, plotNo: text })}
                  placeholder="Enter Plot No"
                />

                <View style={styles.buttonRow}>
                  <EasyButton medium primary onPress={updateMonitoring}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
                  </EasyButton>
                  <EasyButton medium style={styles.cancelButton} onPress={handleModalClose}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
                  </EasyButton>
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
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3498db",
    padding: 20,
    borderRadius: 50,
    elevation: 5,
  },
  modalView: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdown: {
    width: "100%",
    backgroundColor: "#FFF",
    zIndex: 10000,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "red",
    marginLeft: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 5,
  },
  uploadButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  uploadText: {
    fontSize: 16,
    color: '#555',
  },
  imageRow: {
    marginTop: 10,
    marginBottom: 5,
  },
  imageLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default MonitoringScreen;