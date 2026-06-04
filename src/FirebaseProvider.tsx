import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, loginWithGoogle, loginAnonymously, logoutUser } from './firebase';
import { CameraFeed, VerificationLog, WhatsAppSchedule, DVRAccessDevice, NDSClient, IntelbrasDVR, SubscriptionPlan } from './types';
import { INITIAL_FEEDS, INITIAL_LOGS, INITIAL_SCHEDULES, INITIAL_DVR_DEVICES } from './data';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isFirebaseActive: boolean;
  feeds: CameraFeed[];
  logs: VerificationLog[];
  schedules: WhatsAppSchedule[];
  dvrDevices: DVRAccessDevice[];
  registeredClients: NDSClient[];
  intelbrasDvrs: IntelbrasDVR[];
  
  // Auth Triggers
  login: () => Promise<User>;
  loginAnonymously: () => Promise<User>;
  logout: () => Promise<void>;

  // Data Mutation Triggers (Wrapped in firestore errors)
  saveFeed: (feed: CameraFeed) => Promise<void>;
  deleteFeed: (feedId: string) => Promise<void>;
  
  saveLog: (log: VerificationLog) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;

  saveSchedule: (schedule: WhatsAppSchedule) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;

  saveDvrDevice: (device: DVRAccessDevice) => Promise<void>;
  deleteDvrDevice: (deviceId: string) => Promise<void>;

  saveRegisteredClient: (client: NDSClient) => Promise<void>;
  deleteRegisteredClient: (clientId: string) => Promise<void>;

  saveIntelbrasDvr: (dvr: IntelbrasDVR) => Promise<void>;
  deleteIntelbrasDvr: (dvrId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase deve ser usado sob um FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Connected database collections for the active user
  const [feeds, setFeeds] = useState<CameraFeed[]>([]);
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [schedules, setSchedules] = useState<WhatsAppSchedule[]>([]);
  const [dvrDevices, setDvrDevices] = useState<DVRAccessDevice[]>([]);
  const [registeredClients, setRegisteredClients] = useState<NDSClient[]>([]);
  const [intelbrasDvrs, setIntelbrasDvrs] = useState<IntelbrasDVR[]>([]);

  // Function to bootstrap user's collection if empty
  const bootstrapUserData = async (uid: string) => {
    try {
      const feedsRef = collection(db, 'feeds');
      const q = query(feedsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('Bootstrapping default records for new user:', uid);

        // Bootstrap feeds
        for (const item of INITIAL_FEEDS) {
          const docId = `feed_${uid}_${item.id}`;
          await setDoc(doc(db, 'feeds', docId), { ...item, id: docId, userId: uid });
        }

        // Bootstrap schedules
        for (const item of INITIAL_SCHEDULES) {
          const docId = `sched_${uid}_${item.id}`;
          await setDoc(doc(db, 'schedules', docId), { ...item, id: docId, userId: uid });
        }

        // Bootstrap dvr devices
        for (const item of INITIAL_DVR_DEVICES) {
          const docId = `device_${uid}_${item.id}`;
          await setDoc(doc(db, 'dvr_devices', docId), { ...item, id: docId, userId: uid });
        }

        // Bootstrap verification logs
        for (const item of INITIAL_LOGS) {
          const docId = `log_${uid}_${item.id}`;
          await setDoc(doc(db, 'logs', docId), { ...item, id: docId, userId: uid });
        }
      }
    } catch (err) {
      console.error('Error bootstrapping default records:', err);
    }
  };

  // Auth synchronization hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Bootstrap first
        await bootstrapUserData(currentUser.uid);
      } else {
        // Reset states when logging out
        setFeeds([]);
        setLogs([]);
        setSchedules([]);
        setDvrDevices([]);
        setRegisteredClients([]);
        setIntelbrasDvrs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Data Listeners hook (Attached only when signed in and email_verified represents real user)
  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    // 1. Feeds collection listener
    const unsubscribeFeeds = onSnapshot(
      query(collection(db, 'feeds'), where('userId', '==', uid)),
      (snapshot) => {
        const list: CameraFeed[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as CameraFeed);
        });
        setFeeds(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'feeds')
    );

    // 2. Logs collection listener
    const unsubscribeLogs = onSnapshot(
      query(collection(db, 'logs'), where('userId', '==', uid)),
      (snapshot) => {
        const list: VerificationLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as VerificationLog);
        });
        // Sort logs descending by timestamp
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'logs')
    );

    // 3. Schedules collection listener
    const unsubscribeSchedules = onSnapshot(
      query(collection(db, 'schedules'), where('userId', '==', uid)),
      (snapshot) => {
        const list: WhatsAppSchedule[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as WhatsAppSchedule);
        });
        setSchedules(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'schedules')
    );

    // 4. DVR devices collection listener
    const unsubscribeDevices = onSnapshot(
      query(collection(db, 'dvr_devices'), where('userId', '==', uid)),
      (snapshot) => {
        const list: DVRAccessDevice[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as DVRAccessDevice);
        });
        setDvrDevices(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'dvr_devices')
    );

    // 5. Registered Clients collection listener
    const unsubscribeClients = onSnapshot(
      query(collection(db, 'registered_clients'), where('userId', '==', uid)),
      (snapshot) => {
        const list: NDSClient[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as NDSClient);
        });
        setRegisteredClients(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'registered_clients')
    );

    // 6. Intelbras DVRs listener
    const unsubscribeDvrs = onSnapshot(
      query(collection(db, 'cloud_dvrs'), where('userId', '==', uid)),
      (snapshot) => {
        const list: IntelbrasDVR[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as IntelbrasDVR);
        });
        setIntelbrasDvrs(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'cloud_dvrs')
    );

    return () => {
      unsubscribeFeeds();
      unsubscribeLogs();
      unsubscribeSchedules();
      unsubscribeDevices();
      unsubscribeClients();
      unsubscribeDvrs();
    };
  }, [user]);

  // Auth Operations
  const handleLogin = async () => {
    return await loginWithGoogle();
  };

  const handleLoginAnonymously = async () => {
    return await loginAnonymously();
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // Mutator Operations (strict try-catch with handleFirestoreError according to SKILL.md)

  const saveFeed = async (feed: CameraFeed) => {
    if (!user) return;
    const path = `feeds/${feed.id}`;
    try {
      const finalDoc = { ...feed, userId: user.uid };
      await setDoc(doc(db, 'feeds', feed.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteFeed = async (feedId: string) => {
    if (!user) return;
    const path = `feeds/${feedId}`;
    try {
      await deleteDoc(doc(db, 'feeds', feedId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveLog = async (log: VerificationLog) => {
    if (!user) return;
    const path = `logs/${log.id}`;
    try {
      const finalDoc = { ...log, userId: user.uid };
      await setDoc(doc(db, 'logs', log.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!user) return;
    const path = `logs/${logId}`;
    try {
      await deleteDoc(doc(db, 'logs', logId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveSchedule = async (schedule: WhatsAppSchedule) => {
    if (!user) return;
    const path = `schedules/${schedule.id}`;
    try {
      const finalDoc = { ...schedule, userId: user.uid };
      await setDoc(doc(db, 'schedules', schedule.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!user) return;
    const path = `schedules/${scheduleId}`;
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveDvrDevice = async (device: DVRAccessDevice) => {
    if (!user) return;
    const path = `dvr_devices/${device.id}`;
    try {
      const finalDoc = { ...device, userId: user.uid };
      await setDoc(doc(db, 'dvr_devices', device.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteDvrDevice = async (deviceId: string) => {
    if (!user) return;
    const path = `dvr_devices/${deviceId}`;
    try {
      await deleteDoc(doc(db, 'dvr_devices', deviceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveRegisteredClient = async (client: NDSClient) => {
    if (!user) return;
    const path = `registered_clients/${client.id}`;
    try {
      const finalDoc = { ...client, userId: user.uid };
      await setDoc(doc(db, 'registered_clients', client.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteRegisteredClient = async (clientId: string) => {
    if (!user) return;
    const path = `registered_clients/${clientId}`;
    try {
      await deleteDoc(doc(db, 'registered_clients', clientId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveIntelbrasDvr = async (dvr: IntelbrasDVR) => {
    if (!user) return;
    const path = `cloud_dvrs/${dvr.id}`;
    try {
      const finalDoc = { ...dvr, userId: user.uid };
      await setDoc(doc(db, 'cloud_dvrs', dvr.id), finalDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteIntelbrasDvr = async (dvrId: string) => {
    if (!user) return;
    const path = `cloud_dvrs/${dvrId}`;
    try {
      await deleteDoc(doc(db, 'cloud_dvrs', dvrId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      isFirebaseActive: !!user,
      feeds,
      logs,
      schedules,
      dvrDevices,
      registeredClients,
      intelbrasDvrs,
      
      login: handleLogin,
      loginAnonymously: handleLoginAnonymously,
      logout: handleLogout,
      
      saveFeed,
      deleteFeed,
      saveLog,
      deleteLog,
      saveSchedule,
      deleteSchedule,
      saveDvrDevice,
      deleteDvrDevice,
      saveRegisteredClient,
      deleteRegisteredClient,
      saveIntelbrasDvr,
      deleteIntelbrasDvr
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};
