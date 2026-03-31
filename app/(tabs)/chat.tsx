import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where, getDocs, limit } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { 
  FlatList, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, 
  Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image 
} from "react-native";
import { auth, db, getPrivateChatId, getAllUsers } from "../../firebaseConfig";

interface Message {
  id: string;
  texto?: string;
  text?: string;
  usuario?: string;
  senderId?: string;
  senderEmail?: string;
  fecha?: any;
  timestamp?: any;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  lastSeen?: any;
}

type ChatMode = 'list' | 'group' | 'private';

export default function ChatScreen() {
  const [chatMode, setChatMode] = useState<ChatMode>('list');
  const [activeTab, setActiveTab] = useState<'group' | 'private'>('group');
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load users for private chat
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await getAllUsers();
      const currentUid = auth.currentUser?.uid;
      setUsers(allUsers.filter((u: any) => u.uid !== currentUid));
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoadingUsers(false);
  };

  // Listen to group messages
  useEffect(() => {
    if (chatMode !== 'group') return;
    
    const q = query(
      collection(db, "mensajes"),
      orderBy("fecha", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Message[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMensajes(lista);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    });

    return unsubscribe;
  }, [chatMode]);

  // Listen to private messages
  useEffect(() => {
    if (chatMode !== 'private' || !selectedUser) return;
    
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const chatId = getPrivateChatId(currentUid, selectedUser.uid);
    const q = query(
      collection(db, "privateChats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Message[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMensajes(lista);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    });

    return unsubscribe;
  }, [chatMode, selectedUser]);

  // Send group message
  const enviarMensajeGrupo = async () => {
    if (mensaje.trim() === "") return;

    await addDoc(collection(db, "mensajes"), {
      texto: mensaje,
      usuario: auth.currentUser?.email || "Anónimo",
      fecha: serverTimestamp(),
    });

    setMensaje("");
  };

  // Send private message
  const enviarMensajePrivado = async () => {
    if (mensaje.trim() === "" || !selectedUser) return;
    
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const chatId = getPrivateChatId(currentUid, selectedUser.uid);
    
    // Create/update chat metadata
    await setDoc(doc(db, "privateChats", chatId), {
      participants: [currentUid, selectedUser.uid],
      lastMessage: mensaje,
      lastMessageTime: serverTimestamp(),
    }, { merge: true });

    // Add message
    await addDoc(collection(db, "privateChats", chatId, "messages"), {
      text: mensaje,
      senderId: currentUid,
      senderEmail: auth.currentUser?.email || "Anónimo",
      timestamp: serverTimestamp(),
    });

    setMensaje("");
  };

  const openGroupChat = () => {
    setChatMode('group');
    setMensajes([]);
  };

  const openPrivateChat = (user: UserProfile) => {
    setSelectedUser(user);
    setChatMode('private');
    setMensajes([]);
  };

  const goBackToList = () => {
    setChatMode('list');
    setSelectedUser(null);
    setMensajes([]);
  };

  // Render message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    const isGroup = chatMode === 'group';
    const currentEmail = auth.currentUser?.email;
    const currentUid = auth.currentUser?.uid;
    
    const isMine = isGroup 
      ? item.usuario === currentEmail 
      : item.senderId === currentUid;
    
    const messageText = isGroup ? item.texto : item.text;
    const senderName = isGroup ? item.usuario : item.senderEmail;
    const timeField = isGroup ? item.fecha : item.timestamp;
    
    let timeString = "";
    try {
      if (timeField && timeField.toDate) {
        timeString = timeField.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {}

    return (
      <View style={[styles.messageBubbleRow, isMine ? styles.myRow : styles.otherRow]}>
        {!isMine && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>
              {(senderName || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          {!isMine && (
            <Text style={styles.senderName}>{senderName?.split('@')[0]}</Text>
          )}
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
            {messageText}
          </Text>
          {timeString ? (
            <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.otherTimeText]}>
              {timeString}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // Chat list screen
  if (chatMode === 'list') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensajes</Text>
          <Text style={styles.headerSubtitle}>Chatea con la comunidad</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'group' && styles.activeTab]}
            onPress={() => setActiveTab('group')}
          >
            <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>
              💪 Sala General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'private' && styles.activeTab]}
            onPress={() => setActiveTab('private')}
          >
            <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>
              👤 Chat Privado
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'group' ? (
          <TouchableOpacity style={styles.groupChatCard} onPress={openGroupChat}>
            <View style={styles.groupIconContainer}>
              <Text style={styles.groupIcon}>👥</Text>
            </View>
            <View style={styles.groupChatInfo}>
              <Text style={styles.groupChatTitle}>Sala General de Fitness</Text>
              <Text style={styles.groupChatDesc}>Chat en tiempo real con todos los miembros</Text>
            </View>
            <View style={styles.enterArrow}>
              <Text style={styles.enterArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.usersListContainer}>
            {loadingUsers ? (
              <ActivityIndicator size="large" color="#D0FD3E" style={{ marginTop: 40 }} />
            ) : users.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏋️</Text>
                <Text style={styles.emptyTitle}>No hay otros usuarios aún</Text>
                <Text style={styles.emptyDesc}>¡Invita a tus amigos a unirse!</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={loadUsers}>
                  <Text style={styles.refreshBtnText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.userCard} 
                    onPress={() => openPrivateChat(item)}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {(item.displayName || item.email || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {item.displayName || item.email?.split('@')[0] || 'Usuario'}
                      </Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={styles.chatNowBadge}>
                      <Text style={styles.chatNowText}>Chat</Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersList}
              />
            )}
          </View>
        )}
      </View>
    );
  }

  // Active chat screen (group or private)
  const chatTitle = chatMode === 'group' 
    ? '💪 Sala General' 
    : `${selectedUser?.displayName || selectedUser?.email?.split('@')[0] || 'Chat'}`;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={goBackToList} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle}>{chatTitle}</Text>
          <Text style={styles.chatHeaderSub}>
            {chatMode === 'group' ? 'Chat en tiempo real' : selectedUser?.email}
          </Text>
        </View>
        <View style={styles.chatHeaderAvatar}>
          <Text style={styles.chatHeaderAvatarText}>
            {chatMode === 'group' ? '👥' : (selectedUser?.email || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChatState}>
            <Text style={styles.emptyChatEmoji}>💬</Text>
            <Text style={styles.emptyChatText}>No hay mensajes aún</Text>
            <Text style={styles.emptyChatSub}>¡Sé el primero en escribir!</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Escribe un mensaje..."
          value={mensaje}
          onChangeText={setMensaje}
          style={styles.input}
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !mensaje.trim() && styles.sendBtnDisabled]} 
          onPress={chatMode === 'group' ? enviarMensajeGrupo : enviarMensajePrivado}
          disabled={!mensaje.trim()}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  // Header
  header: {
    backgroundColor: '#1C1C1E',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(208, 253, 62, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 5,
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#D0FD3E',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  // Group chat card
  groupChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(137, 108, 254, 0.15)',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(137, 108, 254, 0.3)',
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIcon: {
    fontSize: 28,
  },
  groupChatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  groupChatTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  groupChatDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 4,
  },
  enterArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0FD3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterArrowText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  // Users list
  usersListContainer: {
    flex: 1,
  },
  usersList: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  chatNowBadge: {
    backgroundColor: 'rgba(208, 253, 62, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
  },
  chatNowText: {
    color: '#D0FD3E',
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
  },
  refreshBtn: {
    backgroundColor: '#D0FD3E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Chat header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#D0FD3E',
    fontSize: 22,
    fontWeight: 'bold',
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeaderTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatHeaderSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  chatHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Messages
  messagesList: {
    padding: 16,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarSmallText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#D0FD3E',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#232323',
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 11,
    color: '#896CFE',
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#FFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(0,0,0,0.4)',
  },
  otherTimeText: {
    color: 'rgba(255,255,255,0.3)',
  },
  // Empty chat
  emptyChatState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyChatEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyChatText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyChatSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 5,
  },
  // Input
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    backgroundColor: "#1C1C1E",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    fontSize: 15,
    color: "#FFF",
    maxHeight: 100,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D0FD3E",
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: "#000",
    fontSize: 22,
  },
});