import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const FailedPollinationAdmin = () => {
  const [failedStats, setFailedStats] = useState([]);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchFailedStats();
  }, []);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchFailedStats = async () => {
    setLoadingStats(true);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        setLoadingStats(false);
        return;
      }
      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const failedDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Failed') return;

          // Use updatedAt or createdAt or a specific date field for failure date
          const date = new Date(record.updatedAt || record.createdAt || record.dateOfPollination);
          const weekYear = `${getWeekNumber(date)}-${date.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!failedDataMap[plotNo]) {
            failedDataMap[plotNo] = {};
          }
          if (!failedDataMap[plotNo][gourdType]) {
            failedDataMap[plotNo][gourdType] = {};
          }

          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0;

          if (failedDataMap[plotNo][gourdType][weekYear]) {
            failedDataMap[plotNo][gourdType][weekYear] += pollinatedCount;
          } else {
            failedDataMap[plotNo][gourdType][weekYear] = pollinatedCount;
          }
        });

        const formattedData = Object.keys(failedDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(failedDataMap[plotNo]).map((gourdType) => {
            const plotData = Object.keys(failedDataMap[plotNo][gourdType]).map((key) => ({
              value: failedDataMap[plotNo][gourdType][key],
              dataPointText: failedDataMap[plotNo][gourdType][key].toString(),
              label: key
            }));

            plotData.sort((a, b) => {
              const [weekA, yearA] = a.label.split('-');
              const [weekB, yearB] = b.label.split('-');
              return yearA === yearB
                ? weekA - weekB
                : yearA - yearB;
            });

            return { gourdType, data: [{ value: 0, label: '' }, ...plotData] };
          });

          return { plotNo, gourdTypesData };
        });

        setFailedStats(formattedData);
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch statistics');
    }
    setLoadingStats(false);
  };

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.screenTitle}>
        <Icon name="flower-outline" size={22} color="#ff6347" /> Failed Pollination Statistics
      </Text>
      {loadingStats ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#ff6347" /></View>
      ) : failedStats.length === 0 ? (
        <Text style={styles.noDataText}>No failed pollination records found.</Text>
      ) : failedStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <Icon name="format-list-bulleted-type" size={20} color="#4B5563" />
              <Text style={styles.header}>Plot #{plotData.plotNo}</Text>
            </View>
            {plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>
                  <Icon name="leaf" size={14} color="#ff6347" /> {gourdData.gourdType}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chartContainer}>
                    <LineChart
                      initialSpacing={0}
                      data={gourdData.data}
                      spacing={44}
                      textColor1="#ff6347"
                      textShiftY={-8}
                      textShiftX={-10}
                      textFontSize={12}
                      thickness={4}
                      hideRules
                      yAxisColor="#ff6347"
                      showVerticalLines
                      verticalLinesColor="rgba(255,99,71,0.18)"
                      xAxisColor="#ff6347"
                      color="#ff6347"
                      xAxisLabelTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                      yAxisTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                      noOfSections={4}
                      startAtZero
                      adjustForEmptyLabel={true}
                      width={Math.max(screenWidth, 80 + (Array.isArray(gourdData.data) ? gourdData.data.length : 0) * 34)}
                    />
                  </View>
                </ScrollView>
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: { backgroundColor: "#f6fafd" },
  screenTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#ff6347",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  card: {
    margin: 9,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#ff6347',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f9e5e0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginLeft: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
    color: '#A12A2A',
    marginLeft: 5,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ff6347',
    marginTop: 2,
    marginLeft: 9,
  },
  chartContainer: {
    paddingVertical: 6,
    paddingRight: 8,
    paddingLeft: 2,
    marginBottom: 2,
    marginTop: 2,
    minHeight: 155,
    backgroundColor: "#fff5f3",
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 34,
    marginBottom: 12,
    fontStyle: "italic"
  },
  error: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600"
  },
  loadingContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default FailedPollinationAdmin;