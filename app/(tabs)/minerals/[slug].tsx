import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const images = [
    // Replace these URLs with your own images
    'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/459a90da-a3bf-4620-a324-ffddb2bba39f-nElxfP7Hr4OpAdvxC2moNoHVmpOMeL.jpg',
    'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/965e7025-1ebd-469d-8793-cfae54c77d9e-FpEbGma6MpXAnt295UKzSUPnkoYEeZ.jpeg',
    'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/220f2624-dcf4-46f0-b6ca-fa68f14c94c4-8Q78nYgLyTmjZmthfhrE4GoNIh3B52.jpeg',
];

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
    const { slug } = useLocalSearchParams();
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <View style={styles.container}>
            <Text>Details of user {slug} </Text>
            <PagerView
                style={styles.gallery}
                initialPage={0}
                onPageSelected={e => setCurrentIndex(e.nativeEvent.position)}
            >
                {images.map((uri, idx) => (
                    <View key={idx}>
                        <Image source={{ uri }} style={styles.image} />
                    </View>
                ))}
            </PagerView>
            <View style={styles.indicatorContainer}>
                {images.map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.indicator,
                            idx === currentIndex && styles.activeIndicator,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gallery: {
        marginTop: 20,
        width: width,
        height: 250,
    },
    image: {
        width: width,
        height: 250,
        resizeMode: 'cover',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        margin: 4,
    },
    activeIndicator: {
        backgroundColor: '#333',
    },
});
