import { Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import React, { useMemo, useState } from "react";
import BecomeSellerFormStep1 from "./BecomeSellerFormStep1";
import BecomeSellerFormStep3 from "./BecomeSellerFormStep3";
import BecomeSellerFormStep2 from "./BecomeSellerFormStep2";
import { useFormik } from "formik";
import BecomeSellerFormStep4 from "./BecomeSellerFormStep4";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { createSeller } from "../../../Redux Toolkit/Seller/sellerAuthenticationSlice";
import { updateSeller } from "../../../Redux Toolkit/Seller/sellerSlice";
import { useNavigate } from "react-router-dom";

const sellerFormValues = (profile) => ({
    mobile: profile?.mobile || "",
    otp: "",
    GSTIN: profile?.GSTIN || profile?.gstin || "",
    pickupAddress: {
        name: profile?.pickupAddress?.name || "",
        mobile: profile?.pickupAddress?.mobile || "",
        pincode: profile?.pickupAddress?.pinCode || profile?.pickupAddress?.pincode || "",
        address: profile?.pickupAddress?.address || "",
        locality: profile?.pickupAddress?.locality || "",
        city: profile?.pickupAddress?.city || "",
        state: profile?.pickupAddress?.state || "",
    },
    bankDetails: {
        accountNumber: profile?.bankDetails?.accountNumber || "",
        ifscCode: profile?.bankDetails?.ifscCode || "",
        accountHolderName: profile?.bankDetails?.accountHolderName || "",
    },
    sellerName: profile?.sellerName || "",
    email: profile?.email || "",
    businessDetails: {
        businessName: profile?.businessDetails?.businessName || "",
        businessEmail: profile?.businessDetails?.businessEmail || "",
        businessMobile: profile?.businessDetails?.businessMobile || "",
        logo: profile?.businessDetails?.logo || "",
        banner: profile?.businessDetails?.banner || "",
        businessAddress: profile?.businessDetails?.businessAddress || ""
    },
    password: ""
});
const steps = [
    "Tax Details & Mobile",
    "Pickup Address",
    "Bank Details",
    "Supplier Details",
];
const SellerAccountForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formError, setFormError] = useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { sellerAuth, sellers } = useAppSelector(store => store);
    const existingSeller = Boolean(sellers.profile?.id);
    const saving = sellerAuth.loading || sellers.loading;
    const initialValues = useMemo(() => sellerFormValues(sellers.profile), [sellers.profile]);
    const handleStep = (value) => {
        setActiveStep(activeStep + value);
    };
    const [otp, setOpt] = useState();
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: (values) => {
            const missing = [
                !values.mobile && "mobile",
                !values.GSTIN && "GSTIN",
                !values.pickupAddress.address && "pickup address",
                !values.pickupAddress.city && "city",
                !values.bankDetails.accountNumber && "account number",
                !values.bankDetails.ifscCode && "IFSC",
                !values.bankDetails.accountHolderName && "account holder",
                !values.businessDetails.businessName && "business name",
                !values.sellerName && "seller name",
                !values.email && "email",
                !existingSeller && !values.password && "password",
            ].filter(Boolean);
            if (missing.length) {
                setFormError(`Enter ${missing.join(", ")}`);
                return;
            }
            setFormError("");
            const payload = {
                ...values,
                pickupAddress: {
                    ...values.pickupAddress,
                    pinCode: values.pickupAddress.pincode,
                },
            };
            if (existingSeller) {
                dispatch(updateSeller(payload)).then((result) => {
                    if (updateSeller.fulfilled.match(result)) {
                        navigate("/seller");
                        return;
                    }
                    setFormError(result.payload || "Could not save seller details");
                });
                return;
            }
            dispatch(createSeller(payload));
        },
    });
    const handleOtpChange = (otpValue) => {
        setOpt(otpValue);
        // formik.setFieldValue("opt",otpValue)
    };
    const handleSubmit = () => {
        //submit form data to server
        formik.handleSubmit();
    };
    return (<div>  <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (<Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>))}
        </Stepper>
            <div className="mt-20 space-y-10">
                <div>
                    {activeStep === 0 ? (<BecomeSellerFormStep1 formik={formik} handleOtpChange={handleOtpChange}/>) : activeStep === 1 ? (<BecomeSellerFormStep2 formik={formik}/>) : activeStep === 2 ? (<BecomeSellerFormStep3 formik={formik}/>) : (<BecomeSellerFormStep4 formik={formik} lockEmail={existingSeller}/>)}
                    {formError && <p className="text-sm text-red-600 pt-4">{formError}</p>}
                </div>

                <div className="flex items-center justify-between ">
                    <Button disabled={activeStep === 0} onClick={() => handleStep(-1)} variant="contained">
                        Back
                    </Button>
                    <Button disabled={saving} onClick={activeStep === steps.length - 1
            ? handleSubmit
            : () => handleStep(1)} variant="contained">
                        {activeStep === steps.length - 1 ? saving ? <CircularProgress size="small" sx={{ width: "27px", height: "27px" }}/> : existingSeller ? "Save and open store" : "create account" : "Continue"}
                    </Button>
                </div>
            </div> </div>);
};
export default SellerAccountForm;
