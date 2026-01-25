import { Schema } from 'mongoose';
import { encrypt, decrypt } from '@/lib/utils/encryption';

interface EncryptionOptions {
  fields: string[];
}

/**
 * Mongoose plugin to encrypt/decrypt fields automatically.
 * 
 * Usage:
 * schema.plugin(mongooseEncryption, { fields: ['title', 'description'] });
 */
export function mongooseEncryption(schema: Schema, options: EncryptionOptions) {
  const { fields } = options;

  // Pre-save hook: Encrypt fields
  schema.pre('save', async function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = this as any;

    fields.forEach((field) => {
      // Only encrypt if the path is modified and has a value
      if (doc.isModified(field) && doc[field]) {
        // Ensure we handle string fields; if it's an object/array, we might need JSON.stringify
        // For now, assume fields are strings as per plan
        if (typeof doc[field] === 'string') {
          doc[field] = encrypt(doc[field]);
        }
      }
    });
  });

  // Pre-update hook: Encrypt updated fields
  // Covers findOneAndUpdate, findByIdAndUpdate, updateOne, updateMany
  // Pre-update hook: Encrypt updated fields
  // Covers findOneAndUpdate, findByIdAndUpdate, updateOne, updateMany
  (['findOneAndUpdate', 'updateOne', 'updateMany'] as const).forEach((method) => {
    schema.pre(method, async function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update = (this as any).getUpdate();
      
      if (update) {
        fields.forEach((field) => {
          // Check top-level update (e.g. { title: 'New' })
          if (update[field] && typeof update[field] === 'string') {
            update[field] = encrypt(update[field]);
          }

          // Check $set operator (e.g. { $set: { title: 'New' } })
          if (update.$set && update.$set[field] && typeof update.$set[field] === 'string') {
            update.$set[field] = encrypt(update.$set[field]);
          }
        });
      }
    });
  });

  // Post-init hook: Decrypt fields when document is loaded from DB
  schema.post('init', function (doc) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = doc as any;
    fields.forEach((field) => {
      if (d[field] && typeof d[field] === 'string') {
        const decrypted = decrypt(d[field]);
        d[field] = decrypted;
      }
    });
  });
}
