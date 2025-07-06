import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc,getDoc, setDoc, collection, addDoc, getDocs, updateDoc, onSnapshot , query, where } from "firebase/firestore";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    let unsubscribeSnapshot = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeSnapshot(); // Clean up previous user's snapshot listener

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: currentUser.uid, ...docSnap.data() });
          } else {
            // Handle race condition during sign-up.
            // Set minimal user, will be updated once doc is created.
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
            });
          }
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    let unsubscribeWardrobe = null;

    if (user?.uid) {
      unsubscribeWardrobe = fetchWardrobeData(user.uid);
    }

    return () => {
      if (unsubscribeWardrobe) unsubscribeWardrobe(); // Cleanup listener when component unmounts
    };
  }, [user?.uid]);

  // Function to fetch wardrobe data from Firestore 
  const fetchWardrobeData = (userId) => {
    const wardrobeQuery = query(collection(db, "Wardrobes"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(wardrobeQuery, (querySnapshot) => {
      const fetchedWardrobes = [];

      querySnapshot.forEach((docSnap) => {
        const wardrobeData = docSnap.data();
        fetchedWardrobes.push({ id: docSnap.id, ...wardrobeData });
      });

      console.log("✅ Wardrobe Data Updated in Real-Time:", fetchedWardrobes);
      setUser((prevUser) => ({
        ...prevUser,
        wardrobes: fetchedWardrobes,  // Update wardrobes in user state
      }));
    });

    return unsubscribe; // Return for cleanup
  };

  // Function to save wardrobe data and items
  const saveWardrobeData = async (wardrobeName, wardrobeImage, wardrobeItems) => {
    if (!user || !user.uid) {
      alert("⚠️ No user found to save wardrobe data!");
      return;
    }

    try {
      // Create a new wardrobe with a unique ID
      const wardrobesCollectionRef = collection(db, "Wardrobes");
      const newWardrobeRef = await addDoc(wardrobesCollectionRef, {
        userId: user.uid,  // Store user reference
        wardrobeName,
        wardrobeImage,
        createdAt: new Date(),
      });

      const wardrobeId = newWardrobeRef.id; // Get the newly created wardrobe ID
      console.log("✅ New wardrobe created with ID:", wardrobeId);

      // Reference to the items sub-collection inside the new wardrobe
      const itemsCollectionRef = collection(db, "Wardrobes", wardrobeId, "items");

      if (wardrobeItems && Array.isArray(wardrobeItems)) {
        for (const item of wardrobeItems) {
          await addDoc(itemsCollectionRef, {
            selectedBox: item.selectedBox,
            boxType: item.Boxtype,
          });
        }
      }

      alert("✅ New wardrobe and items saved successfully!");
    } catch (error) {
      console.error("❌ Error saving new wardrobe:", error);
      alert("❌ Failed to save new wardrobe. Please try again.");
    }
  };

  // Function to save profile
  const handleSaveProfile = async (updatedData) => {
    if (!user?.uid) {
      alert("⚠️ No user found to update!");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updatedData);

      // Manually update context for immediate UI feedback, though onSnapshot will also fire.
      setUser((prevUser) => ({
        ...prevUser,
        ...updatedData,
      }));

      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      alert("❌ Failed to update profile. Please try again.");
    }
  };

  // Function to log out user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("✅ User logged out successfully!");
    } catch (error) {
      console.error("❌ Error logging out:", error);
      alert("❌ Failed to log out. Please try again.");
    }
  };
  const handleSeasonChange = (season) => {
    console.log(`Season changed to: ${season}`);
  };
  
  return (
    <UserContext.Provider value={{ user, setUser, handleSaveProfile, logout, saveWardrobeData, handleSeasonChange ,db  }}>
      {children}
    </UserContext.Provider>
  );
};    