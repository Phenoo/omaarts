import { db } from '../config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { Enquiry } from '../../types';

export async function createEnquiry(
  data: Omit<Enquiry, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  try {
    const colRef = collection(db, 'enquiries');
    const docData = {
      ...data,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(colRef, docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating enquiry:', error);
    throw error;
  }
}

export async function getEnquiries(status?: Enquiry['status']): Promise<Enquiry[]> {
  try {
    const colRef = collection(db, 'enquiries');
    let q = query(colRef, orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(colRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Enquiry[];
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    throw error;
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry['status']
): Promise<void> {
  try {
    const docRef = doc(db, 'enquiries', id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating enquiry status ${id}:`, error);
    throw error;
  }
}
