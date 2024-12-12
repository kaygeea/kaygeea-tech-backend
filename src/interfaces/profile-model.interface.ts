import { InsertOneResult } from "mongodb";
import { IUserProfile } from "./user-profile.interface.js";
import { RegisterRequestDto } from "../utils/DTOs/register-request.dto.js";

export interface IProfileModel {
  createUserProfile(
    userInitData: RegisterRequestDto,
  ): Promise<InsertOneResult | null>;

  fetchUserProfileBy(
    fetchCriteria: keyof Pick<IUserProfile, "email" | "username">,
    fetchCriteriaValue: string,
  ): Promise<IUserProfile | null>;
}
