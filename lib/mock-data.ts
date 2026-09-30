import type { Order, ServiceStep } from "@/lib/types";

export const mockOrder: Order = {
  id: "XB20260930001",
  pet: { id: "pet-doubao", name: "豆包", species: "猫", breed: "英短", age: 2 },
  serviceType: "上门喂养",
  providerName: "小陈",
  scheduledStart: "18:00",
  scheduledEnd: "19:00",
  actualStart: "2026-09-30T18:02:00+08:00",
  actualEnd: null,
  status: "IN_SERVICE",
};

export const initialSteps: ServiceStep[] = [
  { id: "arrival", name: "到达打卡", required: true, completed: true, completedAt: "2026-09-30T18:02:00+08:00", evidenceRequired: false },
  { id: "pet_check", name: "宠物状态确认", required: true, completed: false, completedAt: null, evidenceRequired: false },
  { id: "feeding", name: "喂食", required: true, completed: false, completedAt: null, evidenceRequired: false },
  { id: "water", name: "换水", required: true, completed: false, completedAt: null, evidenceRequired: false },
  { id: "litter", name: "清理猫砂", required: true, completed: false, completedAt: null, evidenceRequired: false },
  { id: "photo", name: "上传服务照片", required: true, completed: false, completedAt: null, evidenceRequired: true },
  { id: "observation", name: "填写现场备注", required: true, completed: false, completedAt: null, evidenceRequired: false },
  { id: "report", name: "服务报告", required: true, completed: false, completedAt: null, evidenceRequired: false },
];

export const quickNotes = {
  normal: "豆包今天状态正常，进门后很快出来活动，正常吃完食物，也有喝水，没有发现异常。",
  medium: "豆包今天一直躲在床底，吃得比平时少，不过目前没有发现其他异常。",
  high: "豆包今天连续吐了几次，现在站立也不太稳，状态明显异常。",
};
