import mongoose, { Schema } from 'mongoose';

export enum SaleStatus {
  NEW = 'NEW',
  IN_CONTACT = 'IN_CONTACT',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED = 'CLOSED',
  LOST = 'LOST'
}

export interface ISaleNote {
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface ISale {
  customerId: string;
  title: string;
  description: string;
  value: number;
  status: SaleStatus;
  assignedTo: string;
  notes: ISaleNote[];
  statusHistory: {
    status: SaleStatus;
    changedAt: Date;
    changedBy: string;
    note?: string;
  }[];
  expectedClosingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleNoteSchema = new Schema({
  content: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const statusHistorySchema = new Schema({
  status: { 
    type: String, 
    enum: Object.values(SaleStatus), 
    required: true 
  },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, required: true },
  note: { type: String }
});

const saleSchema = new Schema({
  customerId: { 
    type: String, 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  value: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    enum: Object.values(SaleStatus), 
    default: SaleStatus.NEW,
    required: true 
  },
  assignedTo: { 
    type: String, 
    required: true,
    index: true
  },
  notes: [saleNoteSchema],
  statusHistory: [statusHistorySchema],
  expectedClosingDate: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Indexes for common queries
saleSchema.index({ status: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ updatedAt: -1 });

saleSchema.pre('save', function(next) {
  const sale = this as ISale;
  if (this.isModified('status')) {
    const historyEntry = {
      status: sale.status,
      changedAt: new Date(),
      changedBy: sale.assignedTo
    };
    sale.statusHistory.push(historyEntry);
  }
  next();
});

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
