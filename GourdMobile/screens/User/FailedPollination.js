import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const FailedPollination = () => {
  const [failedStats, setFailedStats] = useState([]);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchFailedStats();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchFailedStats = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }

      const userId = context.stateUser?.user?.userId;
      if (!userId) {
        setError('User ID is missing');
        return;
      }

      const response = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const failedDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Failed') return;

          const date = new Date(record.dateOfFinalization || record.updatedAt || record.createdAt || record.dateOfPollination);
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!failedDataMap[plotNo]) {
            failedDataMap[plotNo] = {};
          }

          if (!failedDataMap[plotNo][gourdType]) {
            failedDataMap[plotNo][gourdType] = {};
          }

          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0;

          if (failedDataMap[plotNo][gourdType][weekLabel]) {
            failedDataMap[plotNo][gourdType][weekLabel] += pollinatedCount;
          } else {
            failedDataMap[plotNo][gourdType][weekLabel] = pollinatedCount;
          }
        });

        const formattedData = Object.keys(failedDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(failedDataMap[plotNo]).map((gourdType) => {
            const plotData = Object.keys(failedDataMap[plotNo][gourdType]).map((key) => ({
              value: failedDataMap[plotNo][gourdType][key],
              dataPointText: failedDataMap[plotNo][gourdType][key].toString(),
              label: key,
            }));

            plotData.sort((a, b) => new Date(a.label) - new Date(b.label));

            return { gourdType, data: plotData };
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
  };

  return (
    <ScrollView>
      {failedStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>Weekly Failed Pollinations - Plot No.{plotData.plotNo}</Text>
            {plotData.gourdTypesData && plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>Gourd Type: {gourdData.gourdType}</Text>
                <ScrollView horizontal>
                  <View>
                    <LineChart
                      data={gourdData.data}
                      spacing={50}
                      thickness={2}
                      color="#0BA5A4"
                      hideRules
                      yAxisColor="#0BA5A4"
                      xAxisColor="#0BA5A4"
                      xAxisLabelTextStyle={{ color: 'gray', fontSize: 8 }}
                      yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                      noOfSections={4}
                      startAtZero
                      adjustForEmptyLabel={true}
                      width={screenWidth + (Array.isArray(gourdData.data) ? gourdData.data.length : 0) * 30}
                      dataPointsRadius={6}
                      dataPointsColor="#0BA5A4"
                      dataPointsWidth={2}
                    />
                  </View>
                </ScrollView>
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FailedPollination;