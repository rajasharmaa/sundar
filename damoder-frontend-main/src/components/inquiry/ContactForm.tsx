import React from 'react';
import {
  User, Mail, Phone, Building2,
  Layers, Send, FileCheck, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FormInput, FormSelect, FormTextarea } from './FormElements';

interface ContactFormProps {
  formData: any;
  errors: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  formData,
  errors,
  setFormData,
  onSubmit,
  isSubmitting
}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{title}</h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      {/* Group 1: Personal & Professional Identity */}
      <section>
        {sectionHeader(<User size={20} />, "Requester Profile", "Personal & Professional Identity")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            required
            error={errors.name}
            icon={<User size={18} />}
          />
          <FormInput
            label="Work Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@company.com"
            required
            error={errors.email}
            icon={<Mail size={18} />}
          />
          <FormInput
            label="Contact Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 00000 00000"
            required
            error={errors.phone}
            icon={<Phone size={18} />}
          />
          <FormInput
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Industrial Solutions Ltd."
            icon={<Building2 size={18} />}
          />
        </div>
      </section>

      <div className="h-px bg-slate-100 w-full" />

      {/* Group 2: Project Specifications */}
      <section>
        {sectionHeader(<FileCheck size={20} />, "Project Specifications", "Technical & Sourcing Details")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <FormSelect
              label="Inquiry Category"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              error={errors.subject}
              icon={<Briefcase size={18} />}
              placeholder="Select the type of inquiry"
              options={[
                { value: "Bulk Order", label: "Bulk Order Sourcing" },
                { value: "Custom Manufacturing", label: "Custom Manufacturing" },
                { value: "Technical Support", label: "Technical Support" },
                { value: "Dealership Inquiry", label: "Dealership Inquiry" },
                { value: "Other", label: "Other" }
              ]}
            />
          </div>
          <FormInput
            label="Material Grade"
            name="materialGrade"
            value={formData.materialGrade}
            onChange={handleChange}
            placeholder="e.g. SS304, MS, Brass"
            icon={<Layers size={18} />}
          />
          <FormInput
            label="Estimated Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity in units"
          />

          <div className="md:col-span-2">
            <FormTextarea
              label="Detailed Requirements"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              error={errors.message}
              placeholder="Describe your technical specifications, dimensions, and any specific requests..."
            />
          </div>

          <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${formData.urgent ? 'bg-orange-500' : 'bg-slate-200'}`} />
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.urgent ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                Flag as Urgent Requirement
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Submit Section */}
      <div className="pt-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-4 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing Inquiry...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Initialize Sourcing Protocol</span>
            </>
          )}
        </motion.button>
        <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-[0.15em] text-center">
          * Our technical team typically responds within 24 business hours
        </p>
      </div>
    </form>
  );

};

export default ContactForm;

