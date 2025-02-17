import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, Alert, ToastAndroid, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import styles from './VendorPageStyling';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const API_URL = 'http://162.244.24.16:8000/vendor';

export default function VendorPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartVisible, setCartVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [postModalVisible, setPostModalVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reportText, setReportText] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchProducts();
        fetchCart();
        confirmSingleOrder();
    }, []);

    const fetchProfile = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const response = await fetch('http://162.244.24.16:8000/user/user-details', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const profileData = await response.json();
            console.log('Fetched profile data:', profileData); // Log profile data
            return profileData; // Ensure this returns a valid object
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null; // Return null if there's an error
        }
    };

    const handleReportVendor = async () => {
        ToastAndroid.show('Report error!', ToastAndroid.SHORT);
        // if (!reportText) {
        //     ToastAndroid.show('Report text is required!', ToastAndroid.SHORT);
        //     return;
        // }

        // setLoading(true);
        // try {
        //     const accessToken = await AsyncStorage.getItem('access_token');
        //     if (!accessToken) {
        //         ToastAndroid.show('Please log in to report a vendor.', ToastAndroid.SHORT);
        //         setLoading(false);
        //         return;
        //     }

        //     const response = await fetch(`http://162.244.24.16:8000/vendor/farmer/report-vendor/${vendor_id}/`, {
        //         method: 'POST',
        //         headers: {
        //             'Authorization': `Bearer ${accessToken}`,
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ report_text: reportText }), // Send report text
        //     });

        //     if (response.ok) {
        //         ToastAndroid.show('Vendor reported successfully!', ToastAndroid.SHORT);
        //         navigation.goBack(); // Navigate back or to another screen
        //     } else {
        //         const errorData = await response.json();
        //         ToastAndroid.show(errorData.detail || 'Failed to report vendor.', ToastAndroid.SHORT);
        //     }
        // } catch (error) {
        //     console.error('Error reporting vendor:', error);
        //     ToastAndroid.show('Network error! Please try again.', ToastAndroid.SHORT);
        // } finally {
        //     setLoading(false);
        // }
    };

    const confirmSingleOrder = async (item) => {
        const profileData = await fetchProfile();

        if (!profileData || !profileData.user) {
            ToastAndroid.show('Unable to fetch user profile. Please try again.', ToastAndroid.SHORT);
            return;
        }
        const orderData = {
            items: [{
                id: item.id,
                title: item.title,
                price: item.price,
                status: 'Pending',
            }],
            usertitle: profileData.user.username,
            userContact: profileData.user.phone,
            totalPrice: parseFloat(item.price.replace('Rs: ', '')),
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };

        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!accessToken) {
                ToastAndroid.show('You need to be logged in to place an order.', ToastAndroid.SHORT);
                return;
            }

            const response = await fetch(`${API_URL}/farmer/place-order/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const responseBody = await response.json();

            if (response.ok) {
                ToastAndroid.show(`Your order for ${item.title} has been placed successfully!`, ToastAndroid.SHORT);
            } else if (response.status === 403) {
                ToastAndroid.show('You are not authorized to place this order. Please check your account permissions.', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(responseBody.detail || 'Failed to place the order. Please try add to cart first!.', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Failed to place the order. Please try again.', ToastAndroid.SHORT);
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!accessToken) {
                ToastAndroid.show('Error', 'You need to be logged in to cancel an order.', ToastAndroid.SHORT);
                return;
            }
            const response = await fetch(`${API_URL}/farmer/cancel-order/${orderId}/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const responseText = await response.text();
            if (response.ok) {
                ToastAndroid.show(`Your order with ID ${orderId} has been canceled successfully!`, ToastAndroid.SHORT);
                setCart((prevCart) => prevCart.filter(item => item.id !== orderId));
            } else {
                ToastAndroid.show('Failed to cancel the order. Please try again.', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Failed to cancel the order. Please try again.', ToastAndroid.SHORT);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            if (!accessToken) {
                ToastAndroid.show('Please log in to view products.', ToastAndroid.SHORT);
                navigation.navigate('LoginScreen');
                return;
            }

            const response = await fetch('http://162.244.24.16:8000/vendor/farmer/products_list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                const errorText = await response.text();
                ToastAndroid.show(`Error fetching products: ${response.status} - ${errorText}`, ToastAndroid.SHORT);

                if (response.status === 401) {
                    ToastAndroid.show('Session expired. Please log in again.', ToastAndroid.SHORT);
                    navigation.navigate('LoginScreen');
                }
            }
        } catch (error) {
            ToastAndroid.show('Network error! Please try again.', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        setLoading(true); // Start loading
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const response = await fetch(`http://162.244.24.16:8000/vendor/cart/products/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            setCart(Array.isArray(data.products) ? data.products : []);
        } catch (error) {
            // console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (item) => {
        const isInCart = cart.some((cartItem) => cartItem.product === item.id); // Check based on product ID
        if (isInCart) {
            handleRemoveFromCart(item);
            return;
        }
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/cart/add/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: item.id, quantity: 1 }),
            });
            if (response.ok) {
                // Update the cart state immediately after adding
                setCart((prevCart) => [...prevCart, { id: item.id, product: item.id, product_price: item.price, quantity: 1 }]);
                ToastAndroid.show('Added to cart!', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Error adding to cart! ', error, ToastAndroid.SHORT);
        }
    };

    const handleRemoveFromCart = async (item) => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            // Check if the item exists in the cart before removing it
            const cartItem = cart.find((cartItem) => cartItem.id === item.id);
            if (!cartItem) {
                ToastAndroid.show('Item not found in cart! ', ToastAndroid.SHORT);
                return;
            }
            const response = await fetch(`${API_URL}/cart/remove/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: cartItem.product }),
            });

            if (response.ok) {
                ToastAndroid.show('Removed from Cart! ', ToastAndroid.SHORT);
                // Update the cart state
                setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== item.id));
            } else {
                const errorData = await response.json();
                ToastAndroid.show('Failed to Remove from Cart', ToastAndroid.SHORT);
            }
        } catch (error) {
            // console.error('Error removing from cart:', error);
            Toast.show({ type: 'error', text1: 'Failed to Remove from Cart', text2: error.message });
        }
    };

    const handlePostProduct = async () => {
        console.log("Post Product function triggered");

        // Validate fields
        if (!title || !description || !price || !category || !image) {
            console.log("Validation failed: Missing required fields");
            console.log("Title:", title);
            console.log("Description:", description);
            console.log("Price:", price);
            console.log("Category:", category);
            console.log("Image:", image);
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);
            console.log("Loading set to true");

            // Get access token
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!accessToken) {
                console.log("No access token found");
                ToastAndroid.show('Please log in to add a product.', ToastAndroid.SHORT);
                setLoading(false);
                return;
            }

            // Prepare FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('image', {
                uri: image.uri,
                type: image.type || 'image/jpeg',
                name: image.fileName || 'image.jpg',
            });

            // Log the FormData entries
            if (formData.entries) {
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }
            } else {
                console.log("FormData.entries is not a function");
            }

            console.log("FormData prepared:", formData);

            // API Request
            console.log("Sending request to:", `${API_URL}/add-product/`);
            const response = await fetch(`${API_URL}/add-product/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            console.log("Response received. Status:", response.status);
            if (response.ok) {
                ToastAndroid.show('Product added successfully!', ToastAndroid.SHORT);
                fetchProducts();
                setTitle('');
                setDescription('');
                setPrice('');
                setCategory('');
                setImage(null);
                setPostModalVisible(false);
            } else {
                const errorData = await response.json();
                console.log("Error response:", errorData);
                Toast.show({ type: 'error', text1: 'Error adding product', text2: errorData.detail || 'Unknown error' });
            }
        } catch (error) {
            console.error("Network error:", error);
            Toast.show({
                type: 'error',
                text1: 'Network error!',
                text2: error.message,
            });
        } finally {
            setLoading(false);
            console.log("Setting loading to false");
        }
    };


    const openImagePicker = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                includeBase64: false,
            });
            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setImage({
                    uri: selectedImage.uri,
                    type: selectedImage.type,
                    name: selectedImage.fileName || 'image.jpg',
                });
            }
        } catch (error) {
            ToastAndroid.show('Error picking image:', error, ToastAndroid.SHORT);
        }
    };

    const handleMenuClick = () => {
        setIsModalVisible(true);
    };

    // close the modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                    />
                    <TouchableOpacity onPress={() => setCartVisible(true)} style={styles.cartIconWrapper}>
                        <Image source={require('../assets/images/cart.png')} style={{ width: 30, height: 30 }} />
                        {cart.length > 0 && <View style={styles.cartCounter}><Text style={styles.cartCounterText}>{cart.length}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPostModalVisible(true)} style={styles.postButton}>
                        <Image source={require('../assets/images/post.png')} style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007acc" style={{ marginTop: 20 }} />
                ) : (
                    products.filter((product) => product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        <View key={item.id} style={styles.productCard}>
                            <View style={styles.rowContainer}>
                                <Image source={require('../assets/images/first.jpg')} style={styles.productImage} />
                                {/* <Text style={styles.productText}>{profile.username}</Text> */}
                                <Text style={styles.productText}>Unknown User</Text>


                                <TouchableOpacity style={styles.menuButton2} onPress={handleMenuClick}>
                                    <Image source={require('../assets/images/menu.png')} style={styles.menuImage2} />
                                </TouchableOpacity>
                                {/* // Modal for reporting the vendor */}
                                <Modal transparent animationType="fade" visible={isModalVisible} onRequestClose={handleCloseModal}>
                                    <TouchableOpacity style={styles.modalOverlay2} activeOpacity={1} onPress={handleCloseModal}>
                                        <View style={styles.modalContainer2}>
                                            <TouchableOpacity
                                                style={styles.closeButton2}
                                                onPress={handleCloseModal}
                                            >
                                                {/* <Image source={require('../assets/images/cross.png')} style={{}} /> */}
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={handleReportVendor}>
                                                <Text style={{ textAlign: 'center', fontSize: 20 }}>Report the Vendor</Text>
                                                <View style={{ padding: 20, }}>
                                                    <TextInput
                                                        style={{
                                                            height: 100,
                                                            borderColor: 'gray',
                                                            borderWidth: 1,
                                                            borderRadius: 7,
                                                            padding: 10,
                                                            marginBottom: 20,
                                                            textAlignVertical: 'top',
                                                        }}
                                                        placeholder="Enter your report"
                                                        value={reportText}
                                                        onChangeText={setReportText}
                                                        multiline
                                                        numberOfLines={4}
                                                    />
                                                    <TouchableOpacity style={styles.addButton} onPress={handleReportVendor}>
                                                        <Text style={styles.buttonText}>{loading ? 'Reporting...' : 'Report'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </Modal>

                            </View>
                            <Text style={styles.producttitle}>{item.title}</Text>
                            <Text style={styles.productDescription}>{item.description}</Text>
                            <Text style={styles.productPrice}>Rs: {item.price}</Text>

                            <TouchableOpacity style={[styles.orderButton, { backgroundColor: '#0077b6' }]} onPress={() => confirmSingleOrder(item)}>
                                <Text style={styles.buttonText}>Order Now</Text>
                            </TouchableOpacity>

                            <View style={{ marginVertical: 15 }}>
                                <TouchableOpacity
                                    style={cart.find((cartItem) => cartItem.id === item.id) ? styles.removeButton : styles.addButton}
                                    onPress={() => addToCart(item)}
                                >
                                    <Text style={styles.buttonText}>
                                        {cart.find((cartItem) => cartItem.id === item.id) ? 'Remove from Cart' : 'Add to Cart'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))
                )}

                <Modal visible={cartVisible} animationType="slide">
                    <View style={modalStyles.container}>
                        <Text style={modalStyles.title}>Your Cart</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color="#007acc" style={{ marginTop: 20 }} />
                        ) : cart.length === 0 ? (
                            <Text style={modalStyles.emptyText}>No items in the cart!</Text>
                        ) : (
                            <FlatList
                                data={cart}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={modalStyles.itemContainer}>
                                        <Image
                                            source={require('../assets/images/fertilizer.jpg')}
                                            style={modalStyles.itemImage}
                                        />
                                        <View>
                                            <Text style={modalStyles.itemTitle}>Product ID: {item.product}</Text>
                                            <Text style={modalStyles.itemPrice}>${item.product_price}</Text>
                                            <Text style={{ color: 'green' }}>Quantity: {item.quantity}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveFromCart(item)}>
                                            <Text style={modalStyles.removeText}>Remove</Text>
                                        </TouchableOpacity>
                                        {/* Cancel Order Button */}
                                        <TouchableOpacity onPress={() => cancelOrder(item.id)} style={modalStyles.cancelButton}>
                                            <Text style={modalStyles.cancelButtonText}>Cancel Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                        <TouchableOpacity
                            style={modalStyles.closeButton}
                            onPress={() => setCartVisible(false)}
                        >
                            <Text style={modalStyles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                <Modal visible={postModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Post Product</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Title"
                                value={title}
                                onChangeText={(text) => setTitle(text)}
                            />
                            <TextInput
                                style={styles.modalTextArea}
                                placeholder="Description"
                                value={description}
                                onChangeText={(text) => setDescription(text)}
                                multiline={true}
                                numberOfLines={4}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Price"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={(text) => setPrice(text)}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Category"
                                value={category}
                                onChangeText={(text) => setCategory(text)}
                            />
                            <TouchableOpacity onPress={openImagePicker} style={styles.imagePicker}>
                                <Text style={styles.imagePickerText}>
                                    {image ? 'Change Image' : 'Pick an Image'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setPostModalVisible(false)} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handlePostProduct} style={styles.postButtonModal}>
                                    <Text style={styles.postButtonTextModal}>Post</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Toast />

            </ScrollView>
        </View>
    );
}


const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    removeText: {
        fontSize: 14,
        color: '#ff4d4d',
        marginLeft: 'auto',
    },
    closeButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});
