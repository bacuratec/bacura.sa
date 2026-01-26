
import React from 'react';
import {
    Hammer,
    Truck,
    Wrench,
    MessageSquare,
    FileText,
    ClipboardCheck,
    GraduationCap,
    Briefcase
} from 'lucide-react';

export const PLATFORM_SERVICES = [
    {
        id: 2,
        name_ar: 'خدمة التوريد',
        name_en: 'Supply Service',
        description_ar: 'توريد أجود المواد والمعدات اللازمة للمشاريع الإنشائية.',
        description_en: 'Supply of high-quality materials and equipment for construction projects.',
        icon: Truck,
        color: '#1b6b91ab'
    },
    {
        id: 1,
        name_ar: 'خدمة التنفيذ',
        name_en: 'Implementation Service',
        description_ar: 'تنفيذ المشاريع الإنشائية والمعمارية بأعلى معايير الجودة والدقة.',
        description_en: 'Execution of construction and architectural projects with the highest quality and precision.',
        icon: Hammer,
        color: '#1b6b91ab'
    },
    {
        id: 3,
        name_ar: 'خدمة الصيانة',
        name_en: 'Maintenance Service',
        description_ar: 'تقديم خدمات الصيانة الدورية والطارئة لضمان استدامة المنشآت.',
        description_en: 'Providing periodic and emergency maintenance services to ensure facility sustainability.',
        icon: Wrench,
        color: '#1b6b91ab'
    },
    {
        id: 5,
        name_ar: 'خدمة تشخيص ودراسة المشاريع',
        name_en: 'Project Diagnosis and Study',
        description_ar: 'إعداد دراسات جدوى وتحليلات فنية متكاملة للمشاريع قبل البدء.',
        description_en: 'Preparing feasibility studies and integrated technical analysis for projects before starting.',
        icon: FileText,
        color: '#1b6b91ab'
    },
    {
        id: 8,
        name_ar: 'خدمة إدارة المشاريع',
        name_en: 'Project Management',
        description_ar: 'إدارة متكاملة للمشاريع من التخطيط وحتى التسليم النهائي.',
        description_en: 'Integrated project management from planning to final delivery.',
        icon: Briefcase,
        color: '#1b6b91ab'
    },
    {
        id: 6,
        name_ar: 'خدمة الإشراف على المشاريع',
        name_en: 'Project Supervision',
        description_ar: 'الإشراف الفني المباشر على مراحل التنفيذ لضمان مطابقة المواصفات.',
        description_en: 'Direct technical supervision of execution stages to ensure specification compliance.',
        icon: ClipboardCheck,
        color: '#1b6b91ab'
    },
    {
        id: 4,
        name_ar: 'خدمة الاستشارات',
        name_en: 'Consulting Service',
        description_ar: 'تقديم استشارات مهنية متخصصة في المجالات الهندسية والتقنية.',
        description_en: 'Providing professional specialized consulting in engineering and technical fields.',
        icon: MessageSquare,
        color: '#1b6b91ab'
    },
    {
        id: 7,
        name_ar: 'خدمة التدريب',
        name_en: 'Training Service',
        description_ar: 'برامج تدريبية متخصصة لتطوير المهارات الهندسية والفنية.',
        description_en: 'Specialized training programs to develop engineering and technical skills.',
        icon: GraduationCap,
        color: '#1b6b91ab'
    }
];

export const ServiceIcon = ({ icon: Icon, color, size = 24, framed = true }) => {
    if (!Icon) return null;

    if (!framed) return <Icon size={size} color={color} />;

    return (
        <div
            className="flex items-center justify-center rounded-2xl border-2 transition-all duration-300"
            style={{
                width: size * 2,
                height: size * 2,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
                color: color
            }}
        >
            <Icon size={size} strokeWidth={2.5} />
        </div>
    );
};
