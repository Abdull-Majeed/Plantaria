// VendorPageStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginRight: 7,
        backgroundColor: '#fff',
    },
    cartIconWrapper: {
        position: 'relative',
        paddingHorizontal: 5
    },
    cartCounter: {
        backgroundColor: '#dc3545',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
        marginLeft: -5,
    },
    cartCounterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productCard: {
        margin: 5,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    productText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    productImage: {
        width: 50,
        height: 50,
        marginBottom: 10,
        borderRadius: 100,
        marginRight: 15
    },
    producttitle: {
        fontSize: 18,
        fontWeight: '400',
        paddingBottom: 10
    },
    productDescription: {

    },
    productPrice: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 10,
    },
    orderButton: {
        backgroundColor: '#373F51'
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    removeButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#212529',
    },
    emptyCartText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#868e96',
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    cartItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    cartItemPrice: {
        color: '#495057',
    },
    removeCartText: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    orderButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 20
    },
    orderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#6c757d',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderConfirmationText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    viewDetailsButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    itemImage: {
        width: 300,
        height: 200,
        alignSelf: 'center',
        marginBottom: 15,
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    itemPrice: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    itemDescription: {
        fontSize: 14,
        marginBottom: 15,
        color: 'grey',
    },
    orderButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    cartItemPrice: {
        color: '#495057',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%', // Ensure the modal does not exceed 80% of the screen height
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#212529',
    },
    modalInput: {
        width: '100%',
        height: 40,
        borderColor: '#777',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    modalTextArea: {
        width: '100%',
        height: 80,
        borderColor: '#777',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        textAlignVertical: 'top', // Ensure text starts at the top of the input
    },
    imagePicker: {
        backgroundColor: '#168aad',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    imagePickerText: {
        color: '#fff',
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    postButtonModal: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    postButtonTextModal: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#fe5f55',
        padding: 10,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuButton2: {
        flex: 1,
        alignItems: 'flex-end',
    },
    menuImage2: {
        width: 20,
        height: 20,
    },
    modalOverlay2: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.16)', // Slightly transparent overlay
        justifyContent: 'center', // Center modal vertically
        alignItems: 'center', // Center modal horizontally    
    },
    modalContainer2: {
        position: 'absolute', // Position it absolutely on the screen
        backgroundColor: '#fff', // White background for modal
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        width: 310, 
        height: 250, 
        justifyContent: 'space-evenly', 
        paddingVertical: 10,
    },
    closeButton2: {
        position: 'absolute',
        top: 5,
        right: 8,  
        marginBottom:10,
        padding:5,
    },
    optionText2: {
        fontSize: 14, 
        color: '#333',
        paddingHorizontal:10,
        paddingVertical:5,
    },
});

export default styles;