import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from 'sonner'
import { setUser } from '@/redux/authSlice'
import { USER_API_ENDPOINT } from '@/utils/constant'
import axios from 'axios'

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(store => store.auth)

  const [input, setInput] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || "",
    resume: user?.profile?.resume || "",
    file: null
  })

  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const sanitizedPhone = value.replace(/[^0-9+\-()\s]/g, "");
      setInput((prev) => ({ ...prev, phoneNumber: sanitizedPhone }));
      return;
    }
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    setInput((prev) => ({ ...prev, file }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const digitsOnly = String(input.phoneNumber).replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      toast.error("Phone number must contain 10-15 digits.");
      return;
    }
    if (!input.fullName.trim() || !input.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    if (input.file && input.file.size > 10 * 1024 * 1024) {
      toast.error("Resume or profile photo must be 10 MB or smaller.");
      return;
    }

    const formData = new FormData();

    formData.append("fullName", input.fullName.trim());
    if (input.email.trim().toLowerCase() !== (user?.email || "").trim().toLowerCase()) {
      formData.append("email", input.email.trim());
    }
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_ENDPOINT}/profile/update`, formData, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and resume.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  name="fullName"
                  type="text"
                  value={input.fullName}
                  onChange={changeEventHandler}
                  className="col-span-3"
                  required
                  maxLength={120} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={input.email}
                  onChange={changeEventHandler}
                  className="col-span-3"
                  required
                  maxLength={254} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">Phone</Label>
                <div className="col-span-3">
                  <Input
                    id="number"
                    name="phoneNumber"
                    type="tel"
                    value={input.phoneNumber}
                    onChange={changeEventHandler}
                    placeholder="10-15 digit phone number"
                    required
                  />
                  {input.phoneNumber && input.phoneNumber.replace(/\D/g, "").length < 10 && (
                    <span className="text-[11px] text-amber-600">
                      Must have at least 10 digits ({input.phoneNumber.replace(/\D/g, "").length}/10)
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={input.bio}
                  onChange={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={input.skills}
                  onChange={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">File</Label>
                <div className="col-span-3">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    onChange={fileChangeHandler}
                  />
                  {input.file ? (
                    <span className="text-[11px] text-purple-600 block mt-1 truncate">
                      Selected: {input.file.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 block mt-1">
                      Upload resume (PDF/DOCX) or profile photo (image)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              {
                loading ?
                  <Button type="button" disabled className="w-full my-4"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait </Button> :
                  <Button type="submit" className="w-full my-4 cursor-pointer hover:bg-blue-800">Update</Button>
              }

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UpdateProfileDialog