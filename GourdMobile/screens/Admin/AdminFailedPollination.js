import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const FailedPollinationAdmin = () => {
  const [failedStats, setFailedStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFailedStats();
  }, []);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchFailedStats = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const failedDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Failed') return;

          const date = new Date(record.dateOfFinalization);
          const weekYear = `${getWeekNumber(date)}-${date.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';
          const variety = record.variety?.name || 'Unknown Variety';

          if (!failedDataMap[plotNo]) {
            failedDataMap[plotNo] = {};
          }

          if (!failedDataMap[plotNo][gourdType]) {
            failedDataMap[plotNo][gourdType] = {};
          }

          if (!failedDataMap[plotNo][gourdType][variety]) {
            failedDataMap[plotNo][gourdType][variety] = {};
          }

          if (failedDataMap[plotNo][gourdType][variety][weekYear]) {
            failedDataMap[plotNo][gourdType][variety][weekYear] += record.pollinatedFlowers || 0;
          } else {
            failedDataMap[plotNo][gourdType][variety][weekYear] = record.pollinatedFlowers || 0;
          }
        });

        const formattedData = Object.keys(failedDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(failedDataMap[plotNo]).map((gourdType) => {
            const varietiesData = Object.keys(failedDataMap[plotNo][gourdType]).map((variety) => {
              const plotData = Object.keys(failedDataMap[plotNo][gourdType][variety]).map((key) => ({
                value: failedDataMap[plotNo][gourdType][variety][key],
                dataPointText: failedDataMap[plotNo][gourdType][variety][key].toString(),
                label: key
              }));

              plotData.sort((a, b) => {
                const [weekA, yearA] = a.label.split('-');
                const [weekB, yearB] = b.label.split('-');

                return yearA === yearB
                  ? weekA - weekB
                  : yearA - yearB;
              });

              return { variety, data: [{ value: 0, label: '' }, ...plotData] };
            });

            return { gourdType, varietiesData };
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
                {gourdData.varietiesData && gourdData.varietiesData.map((varietyData, varietyIndex) => (
                  <View key={varietyIndex}>
                    <Text style={styles.subHeader}>Variety: {varietyData.variety}</Text>
                    <ScrollView horizontal>
                      <View>
                        <LineChart
                          initialSpacing={0}
                          data={varietyData.data}
                          spacing={50}
                          textColor1="yellow"
                          textShiftY={-8}
                          textShiftX={-10}
                          textFontSize={13}
                          thickness={5}
                          hideRules
                          yAxisColor="#0BA5A4"
                          showVerticalLines
                          verticalLinesColor="rgba(14,164,164,0.5)"
                          xAxisColor="#0BA5A4"
                          color="#0BA5A4"
                          xAxisLabelTextStyle={{ color: 'gray', fontSize: 8 }}
                          yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                          yAxisLabelPrefix=""
                          yAxisLabelSuffix=""
                          noOfSections={4}
                          startAtZero
                          adjustForEmptyLabel={true}
                          width={screenWidth + varietyData.data.length * 30} // Adjusted width for scrolling
                        />
                      </View>
                    </ScrollView>
                  </View>
                ))}
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

export default FailedPollinationAdmin;