import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
    KeyboardAvoidingView, Platform, ToastAndroid, Image 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ route }) => {
    const navigation = useNavigation();
    const { chatPartnerName } = route.params;
    const [roomId, setRoomId] = useState(route.params?.roomId || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchChatrooms();
    }, []);

    useEffect(() => {
        if (roomId) {
            fetchMessages(roomId);
            const websocket = new WebSocket(`ws://162.244.24.16:8000/ws/chat/${roomId}/`);
            websocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, message]);
            };
            setWs(websocket);
            return () => websocket.close();
        }
    }, [roomId]);

    const fetchCurrentUser = async () => {
        try {
            let username = await AsyncStorage.getItem('username');
            setCurrentUser(username);
        } catch (error) {
            console.error('Failed to fetch user info', error);
        }
    };

    const fetchChatrooms = async () => {
        try {
            let token = await AsyncStorage.getItem('access_token');
            if (!token) return;
            const response = await fetch('http://162.244.24.16:8000/core/chatrooms/', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch chatrooms');
            const data = await response.json();
            if (data.length > 0) {
                setRoomId(data[0].id);
            }
        } catch (error) {
            ToastAndroid.show('Failed to fetch chatrooms', ToastAndroid.SHORT);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            let token = await AsyncStorage.getItem('access_token');
            if (!token) return;
            const response = await fetch(`http://162.244.24.16:8000/core/messages/${roomId}/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            let data = await response.json();
            if (response.ok) {
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        let token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        const messageObject = {
            content: newMessage,
            sender: currentUser,
            chatroom: roomId,  
            timestamp: new Date().toISOString(),
        };

        setMessages((prevMessages) => [...prevMessages, messageObject]);
        setNewMessage('');

        try {
            const response = await fetch("http://162.244.24.16:8000/core/send-message/", {  
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(messageObject),
            });

            let responseText = await response.text();
            console.log("Send Message Response:", response.status, response.statusText);
            console.log("Response Body:", responseText);

            if (response.ok && ws) ws.send(JSON.stringify(messageObject));
        } catch (error) {
            console.error("Failed to send message:", error);
            ToastAndroid.show('Failed to send message', ToastAndroid.SHORT);
        }
    };

    return (
        <LinearGradient colors={['#ffffff', '#f0f0f0']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>{chatPartnerName}</Text>
                </View>
                <ScrollView style={styles.messagesContainer} contentContainerStyle={{ paddingBottom: 20 }} inverted>
                    {messages.map((msg, index) => (
                        <View key={index} style={[styles.messageBubble, msg.sender === currentUser ? styles.myMessage : styles.theirMessage]}>
                            <Text style={styles.senderName}>{msg.sender === currentUser ? 'You' : msg.sender}</Text>
                            <Text style={styles.messageText}>{msg.content}</Text>
                            <Text style={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        value={newMessage}
                        onChangeText={setNewMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Image style={{}}source={require('../assets/images/send.png')}/>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#ffffff', paddingHorizontal: 15 },
    backIcon: { width: 20, height: 20, marginRight: 20 },
    headerText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
    messagesContainer: { flex: 1, padding: 10 },
    messageBubble: { maxWidth: '70%', padding: 10, borderRadius: 10, marginVertical: 5 },
    myMessage: { backgroundColor: '#d1e7dd', alignSelf: 'flex-end', direction: 'rtl' },
    theirMessage: { backgroundColor: '#e9ecef', alignSelf: 'flex-start', direction: 'rtl' },
    messageText: { color: '#333', textAlign: 'right' },
    senderName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2, textAlign: 'right' },
    timestamp: { fontSize: 15, color: '#555', marginTop: 5, textAlign: 'right' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
    textInput: { flex: 1, height: 40, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 10, marginRight: 10 },
    sendButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 50 },
    sendIcon: { color: '#fff' },
});

export default ChatScreen;
