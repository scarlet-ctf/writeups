import json
import os
import zipfile
import shutil
import uuid
import random

CHALLENGE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(CHALLENGE_DIR, 'web', 'static')
TEMP_DIR = os.path.join(CHALLENGE_DIR, 'temp_build')
ZIP_NAME = "myscripts.zip" 

FLOW_IDS = {
    "pizza": str(uuid.uuid4()),
    "music": str(uuid.uuid4()),
    "gif": str(uuid.uuid4()),
    "maintenance": str(uuid.uuid4()),
    "nightguard": str(uuid.uuid4())
}

def get_pizza_flow():
    pizza_jokes = [
        "Why does Freddy love pizza? It's the only thing that doesn't run away after midnight.",
        "Bonnie was banned from the kitchen after mistaking the oven timer for a guitar solo.",
        "Chica says pizza is for sharing, but security footage suggests otherwise.",
        "Foxy prefers his pizza fast—blink and it's already gone.",
        "Management insists the animatronics don't eat pizza. The missing slices disagree.",
        "Pizza night ends at midnight. After that, it's survival night.",
        "The kitchen closes at 11 PM. The animatronics do not.",
        "If the pizza tastes cold, don't ask how long it's been on stage."
    ]

    joke = random.choice(pizza_jokes)

    return f"""Display.ShowMessage
        Message: $'''Pizza Log Entry:
        {joke}'''
        Icon: Display.Icon.None
        Buttons: Display.Buttons.OK
        IsTopMost: True"""

def get_music_flow():
    return """Display.ShowMessage
        Message: $'''You found the flag! :)'''
        Icon: Display.Icon.Information
        Buttons: Display.Buttons.OK
        IsTopMost: True

        Delay
        Duration: 1000

        System.RunDosCommand
        Command: $'''start https://youtu.be/t2seVncZMH4?si=Q4mVhQpYTcVDTpC0'''
    """


def get_gif_flow():
    return """Web.LaunchEdge
        Url: $'''https://media1.tenor.com/m/tqzG9bmtnYAAAAAC/fnaf.gif'''
        WindowState: Web.BrowserWindowState.Normal
    """
def get_night_flow(): 
    """
    SET Power TO 100
    SET Hour TO 12
    SET Alive TO True

    Display.ShowMessage
    Message: $'''Night Shift Initialized.
    12:00 AM
    Power: 100%'''
    Icon: Display.Icon.Information
    Buttons: Display.Buttons.OK
    IsTopMost: True

    WHILE Alive = True AND Hour < 6
        Delay
        Duration: 3000

        GenerateRandomNumber
        MinimumValue: 1
        MaximumValue: 100
        RandomNumber=> EventRoll

        IF EventRoll <= 20 THEN
            Display.ShowMessage
            Message: $'''Camera Check:
    Movement detected in Hallway.'''
            Icon: Display.Icon.Warning
            Buttons: Display.Buttons.OK

            SET Power TO Power - 5
        ELSE IF EventRoll <= 35 THEN
            Display.ShowMessage
            Message: $'''Camera Check:
    Static interference...'''
            Icon: Display.Icon.None
            Buttons: Display.Buttons.OK

            SET Power TO Power - 3
        ELSE IF EventRoll <= 45 THEN
            Display.ShowMessage
            Message: $'''Door Lights Activated.'''
            Icon: Display.Icon.None
            Buttons: Display.Buttons.OK

            SET Power TO Power - 8
        ELSE IF EventRoll >= 95 THEN
            Display.ShowMessage
            Message: $'''JUMPSCARE'''
            Icon: Display.Icon.Error
            Buttons: Display.Buttons.OK

            SET Alive TO False
        END

        IF Power <= 0 THEN
            Display.ShowMessage
            Message: $'''Power Depleted.
    The lights go out...'''
            Icon: Display.Icon.Error
            Buttons: Display.Buttons.OK

            SET Alive TO False
        END

        SET Hour TO Hour + 1

        IF Alive = True THEN
            Display.ShowMessage
            Message: $'''Time Update:
    %Hour%:00 AM
    Power Remaining: %Power%%%'''
            Icon: Display.Icon.None
            Buttons: Display.Buttons.OK
        END
    END

    IF Alive = True THEN
        Display.ShowMessage
        Message: $'''6:00 AM
    You survived the night.'''
        Icon: Display.Icon.Information
        Buttons: Display.Buttons.OK
    ELSE
        System.RunDosCommand
        Command: $'''start https://64.media.tumblr.com/35a3e4177a297e4270356c65ad69a393/tumblr_neuyvkHX1x1susn9uo1_500.gif'''
    END
"""

def get_maintenance_flow():
    return """Display.InputDialog
        Title: $'''Afton Robotics - Maintenance Mode'''
        Message: $'''Enter Technician Clearance Code:'''
        InputType: Display.InputType.Password
        DefaultValue: $''''
        IsTopMost: True
        UserInput=> AuthCode

        Display.ShowMessage
        Message: $'''Initializing animatronic subsystem...
        Firmware check in progress.'''
        Icon: Display.Icon.Information
        Buttons: Display.Buttons.OK
        IsTopMost: True

        System.RunDosCommand
        Command: $'''start https://youtu.be/Blv9qVYlioY?si=wvpDtlWkkbvdjbBm'''

        File.ReadTextFromFile
        System.RunDosCommand
        Command: $'''powershell -Command "$hex = '%EncryptedText%'; $bytes = for ($i=0; $i -lt $hex.Length; $i+=2) { [Convert]::ToByte($hex.Substring($i,2),16) }; [System.Text.Encoding]::Latin1.GetString($bytes)"'''
        StandardOutput=> ByteString
        File: $'''%CD%\\logs\\session.log'''
        Encoding: File.Encoding.UTF8
        Contents=> EncryptedText

        SET FinalVar TO ''

        FOR Index FROM 0 TO Length(ByteString) - 1 STEP 1           
            GetSubtext
            Text: ByteString
            StartIndex: Index
            Length: 1
            Subtext=> Char

            ConvertTextToNumber
            Text: Char
            Number=> Ascii

            SET DecodedAscii TO (Ascii - 87 + 256) % 256
            GetCharacterFromAsciiCode
            AsciiCode: DecodedAscii
            Character=> DecodedChar

            SET FinalVar TO FinalVar + DecodedChar
        END

        IF AuthCode = FinalVar THEN
            XML.ReadFromFile
            File: $'''%CD%\\config\\settings.xml'''
            XmlDocument=> XmlConfig

            XML.GetElementValue
            XmlDocument: XmlConfig
            XPath: $'''//root/network/path'''
            Value=> ApiPath

            SET Body TO $'''{ "input": "%FinalVar%" }'''

            Web.InvokeWebServicePost
            Url: $'''http://girlypies.rusec.ctf%ApiPath%'''
            RequestBody: Body
        ELSE
            Display.ShowMessage
            Message: $'''CRITICAL ERROR: Springlocks Engaged.'''
            Icon: Display.Icon.Error
            Buttons: Display.Buttons.OK
        END

        System.RunDosCommand
        Command: $'''start sounds\\startup_jingle.wav'''

        Display.ShowMessage
        Message: $'''Animatronic ANIM-04 is online.
        Stage-ready and awaiting guests.'''
        Icon: Display.Icon.Warning
        Buttons: Display.Buttons.OK
        IsTopMost: True"""


def generate_zip():
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    
    base_flow_path = os.path.join(TEMP_DIR, "Microsoft.Flow", "flows")
    os.makedirs(os.path.join(TEMP_DIR, "logs"))
    os.makedirs(os.path.join(TEMP_DIR, "config"))

    flows = {
        FLOW_IDS["pizza"]: get_pizza_flow(),
        FLOW_IDS["nightguard"]: get_night_flow(),
        FLOW_IDS["music"]: get_music_flow(),
        FLOW_IDS["gif"]: get_gif_flow(),
        FLOW_IDS["maintenance"]: get_maintenance_flow()

    }

    for guid, definition in flows.items():
        path = os.path.join(base_flow_path, guid)
        os.makedirs(path)
        with open(os.path.join(path, "definition.json"), "w") as f:
            json.dump(definition, f, indent=4)

    with open(os.path.join(TEMP_DIR, "logs", "session.log"), "w") as f:
        f.write("cb7ab8cbb6c7ccc9c7c38ab6beccd0")

    with open(os.path.join(TEMP_DIR, "config", "settings.xml"), "w") as f:
        f.write("<root><network><path>/api/run-flow</path></network></root>")
        
    with open(os.path.join(TEMP_DIR, "config", "env.sh"), "w") as f:
        f.write("DEBUG_LEVEL=1; OFFSET_VAL=1; LOG_ROTATION=TRUE;")

    if not os.path.exists(STATIC_DIR): os.makedirs(STATIC_DIR)
    zip_path = os.path.join(STATIC_DIR, ZIP_NAME)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(TEMP_DIR):
            for file in files:
                zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), TEMP_DIR))
    
    shutil.rmtree(TEMP_DIR)
    print(f"Zip File Generated: {zip_path}")

if __name__ == "__main__":
    generate_zip()